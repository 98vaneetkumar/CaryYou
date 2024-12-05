const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//this is for store last message
const chatConstantSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user"
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: "user"
  },
  lastmessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
  },
  is_delete: {
    type: Number,
    default: 0,
  },
  is_favourite:{
    type:Number,
    default:0
  },  
  is_block:{
    type:Number,
    default:0
  },
  unreadCount:{
    type:Number,
    default:0
  }
},{ timestamps: true });



module.exports = mongoose.models.ChatConstant || mongoose.model('ChatConstant', chatConstantSchema);
