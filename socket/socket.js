const Models = require("../Models/index.js");
const helper = require("../helpers/commonHelper.js");

module.exports = function (io) {
  io.on("connection", (socket) => {
    // http://192.168.1.210:8747/ when from forntend side start on it give this url instead of localhost give ipV4
    console.log("connected user", socket.id);
    //Connect the user  //Test pass
    socket.on("connect_user", async function (data) {
      try {
        const socketId = socket.id;
        const checkUser = await Models.userModel.findOne({
          userId: data.userId,
        });

        if (checkUser) {
          await Models.userModel.updateOne(
            { userId: data.userId },
            { $set: { status: 1, socketId: socketId } }
          );
        } else {
          await Models.userModel.create({
            userId: data.userId,
            socketId: socketId,
            status: 1,
          });
        }

        let success_msg = {
          success_msg: "connected successfully",
        };
        socket.emit("connect_user_listener", success_msg);
      } catch (error) {
        throw error;
      }
    });

    //On click user seen the all message of user one to one after click on user then seen all chat of one user //Test pass
    // Or with groupId find the all messages of groups need groupId and senderId
    socket.on("users_chat_list", async (get_data) => {
      try {
        if (get_data.groupId) {
          const findConstant = await Models.chatConstantModel.find({
            groupId: get_data.groupId,
          });
          if (findConstant) {
            await Models.messageModel.updateMany(
              { groupId: get_data.groupId },
              {
                $addToSet: {
                  groupMessage_read_by: get_data.senderId,
                },
              }
            );
            const chatList = await Models.messageModel
              .find({
                $and: [
                  {
                    groupId: get_data.groupId,
                  },
                  {
                    groupMessage_clear: { $nin: [get_data.senderId] },
                  },
                ],
              })
              .populate({
                path: "senderId receiverId",
                select: "id fullName image email",
                model: Models.userModel,
              });
            const count = await Models.messageModel.countDocuments({
              $and: [
                {
                  $or: [
                    {
                      groupId: get_data.groupId,
                    },
                    { constantId: findConstant._id },
                  ],
                },
                {
                  is_delete: { $ne: get_data.senderId },
                  groupMessage_read_by: { $nin: [get_data.senderId] },
                },
              ],
            });
            const success_messages = {
              success_message: "Users group Chats",
              code: 200,
              unread_message_count: count,
              getdata: chatList.map((message) => {
                const isMessageFromSender =
                  message.senderId === get_data.senderId;
                return {
                  ...message.toObject(),
                  messageSide: isMessageFromSender ? "sender" : "other",
                };
              }),
            };
            socket.emit("users_chat_list_listener", success_messages);
          } else {
            const success_message = {
              error: "Users Chat not found",
              code: 403,
            };
            socket.emit("users_chat_list_listener", success_message);
          }
        } else {
          const findConstant = await Models.chatConstantModel.find({
            $or: [
              { senderId: get_data.senderId, receiverId: get_data.receiverId },
              { receiverId: get_data.senderId, senderId: get_data.receiverId },
            ],
          });

          if (findConstant) {
            await Models.messageModel.updateMany(
              { receiverId: get_data.senderId, senderId: get_data.receiverId },
              {
                $set: { is_read: 1 },
              }
            );
            const chatList = await Models.messageModel
              .find({
                $and: [
                  {
                    $or: [
                      {
                        senderId: get_data.senderId,
                        receiverId: get_data.receiverId,
                      },
                      {
                        receiverId: get_data.senderId,
                        senderId: get_data.receiverId,
                      },
                      { constantId: findConstant._id },
                    ],
                  },
                  {
                    is_delete: { $ne: get_data.senderId },
                  },
                ],
              })
              .populate({
                path: "senderId receiverId",
                select: "id fullName image email",
                model: Models.userModel,
              });
            // .populate('senderId', 'image','email') // Populate sender's profile image
            // .populate('receiverId', 'image','email'); // Populate receiver's profile image;
            const count = await Models.messageModel.countDocuments({
              $and: [
                {
                  $or: [
                    // {
                    //   senderId: get_data.senderId,
                    //   receiverId: get_data.receiverId,
                    // },
                    {
                      receiverId: get_data.senderId,
                      senderId: get_data.receiverId,
                    },
                    // { constantId: findConstant._id },
                  ],
                },
                {
                  is_delete: { $ne: get_data.senderId },
                  is_read: 0,
                },
              ],
            });
            const success_messages = {
              success_message: "Users Chats",
              code: 200,
              unread_message_count: count,
              // getdatas: chatList,
              getdata: chatList.map((message) => {
                const isMessageFromSender =
                  // message.senderId.toString() === get_data.senderId.toString();
                  message.senderId === get_data.senderId;
                return {
                  ...message.toObject(),
                  messageSide: isMessageFromSender ? "sender" : "other",
                };
              }),
            };
            socket.emit("users_chat_list_listener", success_messages);
          } else {
            const success_message = {
              error: "Users Chat not found",
              code: 403,
            };
            socket.emit("users_chat_list_listener", success_message);
          }
        }
      } catch (error) {
        throw error;
      }
    });
    //List of all user with whom sender-User do chat also count the unread message for each user  //Test pass
    //also with groups  //test pass
    socket.on("user_constant_list", async (get_data) => {
      try {
        const { filter, senderId } = get_data;
        let order;
        if (filter === 1) {
          order = { createdAt: 1 }; // Sort by old to new
        } else if (filter === 2) {
          order = { createdAt: -1 }; // Sort by new to old
        } else {
          order = { updatedAt: -1 };
        }

        // Build the query to find chat constants
        const where = {
          $or: [
            { senderId: senderId, is_block: { $ne: 1 } },
            { receiverId: senderId, is_block: { $ne: 1 } },
            { senderId: senderId, is_block: { $exists: false } },
            { receiverId: senderId, is_block: { $exists: false } },
            { groupUserIds: senderId },
          ],
        };

        if (filter == 3) {
          where.is_favourite = 1;
        }

        // Find all chat constants that match the criteria
        const constantList = await Models.chatConstantModel
          .find(where)
          .populate({
            path: "lastmessage",
            select: "senderId receiverId message message_type is_read",
            model: Models.messageModel,
          })
          .populate({
            path: "senderId receiverId",
            select: "id fullName image email",
            model: Models.userModel,
          })
          .populate({
            path: "groupId",
            select: "id eventId",
            model: Models.groupChat,
            populate: {
              path: "eventId",
              select: "id title details",
              model: Models.Event,
            },
          })
          .sort(order);

        const userIds = constantList.map((constant) => {
          if (
            constant.senderId &&
            constant.senderId._id &&
            constant.senderId._id.toString() === senderId
          ) {
            if (constant.receiverId != null) {
              return constant.receiverId._id
                ? constant.receiverId._id.toString()
                : constant.receiverId;
            }
            // else if (constant.groupUserIds.length > 0) {
            //   // Assuming you want to include groupUserIds when receiverId is null
            //   return constant.groupUserIds.map((groupId) => groupId.toString());
            else if (constant.groupId) {
              // Assuming you want to include groupUserIds when receiverId is null
              return constant.groupId;
            } else {
              return null; // Handle the case when both receiverId and groupUserIds are null
            }
          } else {
            if (
              constant.senderId &&
              constant.senderId._id &&
              constant.senderId._id.toString() === senderId
            ) {
              return constant.receiverId != null
                ? constant.receiverId._id?.toString() || constant.receiverId
                : constant.receiverId;
            } else {
              return constant.senderId != null
                ? constant.senderId._id.toString()
                : constant.senderId;
            }
          }
        });

        const unreadMessageCounts = {};

        for (const userId of userIds) {
          if (typeof userId === "string") {
            // Handle one-on-one chats
            const count = await Models.messageModel.countDocuments({
              $and: [
                {
                  $or: [
                    {
                      senderId: userId,
                    },
                  ],
                },
                {
                  receiverId: senderId, // Assuming senderId is the receiver
                  is_read: 0,
                  groupMessage_read_by: { $nin: [get_data.senderId] },
                },
              ],
            });
            unreadMessageCounts[userId] = count;
          } else if (typeof userId === "object") {
            const groupMessages = await Models.messageModel
              .find({
                groupId: userId,
              })
              .select("senderId groupMessage_read_by");
            const count = groupMessages.reduce((total, message) => {
              // Check if senderId is not in the groupMessage_read_by array
              if (!message.groupMessage_read_by.includes(senderId)) {
                return total + 1;
              }
              return total;
            }, 0);

            unreadMessageCounts[userId] = count;
          }
        }

        // Add unread message counts to the constantList
        constantList.forEach((constant) => {
          const senderId = constant.senderId
            ? constant.senderId._id.toString()
            : "";
          const receiverId = constant.receiverId
            ? constant.receiverId._id.toString()
            : "";
          const userId = constant.groupId
            ? constant.groupId.toString()
            : senderId === get_data.senderId
            ? receiverId
            : senderId;
          if (userId) {
            constant.unreadCount = unreadMessageCounts[userId] || "0";
          } else {
            constant.unreadCount = 0; // Handle the case where both senderId and receiverId are null
          }
        });

        const success_message = {
          success_message: "User Constant Chats List with Unread Message Count",
          code: 200,
          getdata: constantList,
        };

        socket.emit("user_constant_chat_list", success_message);
      } catch (error) {
        throw error;
      }
    });
    //Message send //Test pass
    socket.on("send_message", async function (data) {
      try {
          let checkChatConstant = await Models.chatConstantModel.findOne({
            $or: [
              { senderId: data.senderId, receiverId: data.receiverId },
              { senderId: data.receiverId, receiverId: data.senderId },
            ],
          });

          if (checkChatConstant) {
            let saveMsg = await Models.messageModel.create({
              senderId: data.senderId,
              receiverId: data.receiverId,
              message: data.message,
              message_type: data.message_type,
              constantId: checkChatConstant.id,
            });
            await Models.chatConstantModel.updateOne(
              { _id: checkChatConstant._id },
              {
                lastmessage: saveMsg._id,
              }
            );

            let getMsg = await Models.messageModel
              .findOne({
                senderId: saveMsg.senderId,
                receiverId: saveMsg.receiverId,
                _id: saveMsg._id,
              })
              .populate([
                {
                  path: "senderId",
                  select: "id fullName image",
                },
                {
                  path: "receiverId",
                  select: "id fullName image",
                },
              ]);
            if (getMsg) {
              getMsg = getMsg.length > 0 ? getMsg[0] : getMsg;

              const get_socket_id = await Models.userModel.findOne({
                userId: data.receiverId,
              });
              if (get_socket_id) {
                io.to(get_socket_id.socketId).emit("send_message_emit", getMsg);
              }
              socket.emit("send_message_emit", getMsg);
              let user = await Models.userModel.findOne({
                _id: data.receiverId,
              });
              if (user && user.deviceToken) {
                let deviceToken = user.deviceToken;
                let deviceType = user.deviceType;
                getMsg.deviceToken = deviceToken;
                getMsg.deviceType = deviceType;
                let datas = {
                  getMsg,
                  deviceToken,
                  deviceType,
                  chatType: 1,
                };
                await helper.sendPushToIosChat(datas);
              }

              // socket.emit ('send_message_emit', getMsg);
            }
          } else {
            let createChatConstant = await Models.chatConstantModel.create({
              senderId: data.senderId,
              receiverId: data.receiverId,
            });
            let saveMsg = await Models.messageModel.create({
              senderId: data.senderId,
              receiverId: data.receiverId,
              message: data.message,
              message_type: data.message_type,
              constantId: createChatConstant._id,
            });

            await Models.chatConstantModel.updateOne(
              { _id: createChatConstant._id },
              {
                lastmessage: saveMsg._id,
              }
            );

            let getMsg = await Models.messageModel
              .findOne({
                senderId: data.senderId,
                receiverId: data.receiverId,
                _id: saveMsg._id,
              })
              .populate([
                {
                  path: "senderId",
                  select: "id fullName image",
                },
                {
                  path: "receiverId",
                  select: "id fullName image",
                },
              ]);
            if (getMsg) {
              getMsg = getMsg.length > 0 ? getMsg[0] : getMsg;
              const get_socket_id = await Models.userModel.findOne({
                userId: data.receiverId,
              });
              if (get_socket_id) {
                io.to(get_socket_id.socketId).emit("send_message_emit", getMsg);
              }

              socket.emit("send_message_emit", getMsg);
              let user = await Models.userModel.findOne({
                _id: data.receiverId,
              });

              if (user && user.deviceToken) {
                let deviceToken = user.deviceToken;
                let deviceType = user.deviceType;
                getMsg.deviceToken = deviceToken;
                getMsg.deviceType = deviceType;
                let datas = {
                  getMsg,
                  deviceToken,
                  deviceType,
                  chatType: 1,
                };
                await helper.sendPushToIosChat(datas);
              }
              // socket.emit ('send_message_emit', getMsg);
            }
          
        }
      } catch (error) {
        throw error;
      }
    });
    //read message
    socket.on("read_unread", async function (data) {
      try {
          const updateResult = await Models.messageModel.updateMany(
            {
              _id: data.messageId,
              is_read: 0,
            },
            {
              $set: { is_read: 1 },
            }
          );
          const datas = { is_read: 1 };
          socket.emit("read_data_status", datas);
      } catch (error) {
        throw error;
      }
    });
    //clear chat need senderId receiverId and group id if delete form group
    socket.on("clear_chat", async (get_data) => {
      try {
          // Find the message to be clear
          const getMessage = await Models.messageModel.find({
            $or: [
              { senderId: get_data.senderId },
              { receiverId: get_data.senderId },
            ],
            is_delete: { $exists: false },
          });
          if (getMessage) {
            // Update the message's deletedId if it exists
            await Models.messageModel.updateMany(
              {
                $or: [
                  { senderId: get_data.senderId },
                  { receiverId: get_data.senderId },
                ],
                is_delete: { $exists: false },
              },
              { is_delete: get_data.senderId }
            );
          } else {
            // Delete the message if it doesn't exist or already marked as deleted
            await Models.messageModel.deleteMany({
              $or: [
                { senderId: get_data.senderId },
                { receiverId: get_data.senderId },
              ],
              is_delete: { $ne: get_data.senderId },
            });
          }
          // Send success response to the client
          const success_message = {
            success_message: "Message clear successfully",
          };
          socket.emit("clear_chat_listener", success_message);
      } catch (error) {
        throw error;
      }
    });
    //Lister for typing
    socket.on("typing", (data) => {
      const { senderId, receiverId } = data;
      // Broadcast typing event to the receiver
      if (data.groupId) {
        socket.to(data.groupId).emit("typing", senderId);
      } else {
        socket.to(receiverId).emit("typing", senderId);
      }
    });
    // Listen for stopTyping event
    socket.on("stopTyping", (data) => {
      const { senderId, receiverId } = data;
      // Broadcast stopTyping event to the receiver
      if (data.groupId) {
        socket.to(data.groupId).emit("stopTyping", senderId);
      } else {
        socket.to(receiverId).emit("stopTyping", senderId);
      }
    });
    //Delete the message senderId and _id i.e msg id
    socket.on("delete_message", async (get_data) => {
      try {
        let deleteMessage;
        if (Array.isArray(get_data.id)) {
          deleteMessage = await Models.messageModel.deleteOne({
            __id: get_data.messageId,
          });
          //Find last message
          let lastMessage = await Models.chatConstantModel.findOne({
            $or: [
              {
                senderId: get_data.senderId,
                lastmessage: { $in: get_data.id },
              },
              {
                receiverId: get_data.senderId,
                lastmessage: { $in: get_data.id },
              },
            ],
          });
          if (lastMessage) {
            //Then find last message
            let data = await Models.messageModel.findOne(
              {},
              {},
              { sort: { time: -1 } }
            );
            //Then store last message in chatConstant
            await Models.chatConstantModel.updateOne(
              { _id: lastMessage._id },
              { lastmessage: data._id, date: data.date, time: data.time }
            );
          }
          // Send success response to the client
          const success_message = {
            success_message: "Message deleted successfully",
          };
          socket.emit("delete_message_listener", success_message);
        } else {
          deleteMessage = await Models.messageModel.deleteOne({
            __id: get_data.messageId,
          });
          //Find last message
          let lastMessage = await Models.chatConstantModel.findOne({
            $or: [
              { senderId: get_data.senderId, lastmessage: get_data.id },
              { receiverId: get_data.senderId, lastmessage: get_data.id },
            ],
          });
          if (lastMessage) {
            //Then find last message
            let data = await Models.messageModel.findOne(
              {},
              {},
              { sort: { time: -1 } }
            );
            //Then store last message in chatConstant
            await Models.chatConstantModel.updateOne(
              { _id: lastMessage._id },
              { lastmessage: data._id, date: data.date, time: data.time }
            );
          }
        }
        // Send success response to the client
        const success_message = {
          success_message: "Message deleted successfully",
        };
        socket.emit("delete_message_listener", success_message);
      } catch (error) {
        throw error;
      }
    });
    socket.on("report_message", async (get_data) => {
      try {
        let objToSave = {
          senderId: get_data.senderId,
          receiverId: get_data.receiverId,
          message: get_data.message,
        };
        let saveData = await Models.ReportModel.create(objToSave);
        socket.emit("report_message_listener", saveData);
      } catch (error) {
        throw error;
      }
    });
  });
};

//One to one chat
// Backend listerner - emmiter ===1.(connect_user,connect_user_listener), for connect user. 2.(users_chat_list,users_chat_list_listener), for seen single user all messsage
// 3.(user_constant_list,user_constant_chat_list),List of all user with whom sender-User do chat. 4(disconnect_user,disconnect_listener),for discount the user
// 5.(read_unread,read_data_status) for read or unread the message. 6 .(delete_message,delete_message_listener) delete permanetly message
// 7.(send_message,send_message_emit) for send the message. 8.(clear_chat,clear_chat_listener) for clear the chat. 9.(block_user,block_user_listener) for block the user
// 10.(report_message,report_message_listener) for report the user. 11(typing,typing) for typing 12.(stopTyping,stopTyping) for stop typing.
