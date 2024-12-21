const Models = require("../Models/index");

module.exports = {
  createOrder: async (req, res) => {
    try {
      // Define the title (only for response purposes)
      const title = "Create Demo Order";

      // Sample demo order data
      const demoOrder = {
        orderBy: "675449f250481a79e5d4ee95", // Replace with a valid user ID
        restaurant: "675479a8ba9c2d01336fb343", // Replace with a valid restaurant ID
        price: "2.99",
        item: "Gulab Jamun",
        status: 1, // 1 for Pending
        rider: "675150c86b2e0e72def70281", // Replace with a valid rider ID
        riderTip: 1.0,
        orderPickUpTime: new Date(),
        orderPickUpDate: new Date(),
        orderDeliveredTime: null,
        orderDeliveredDate: null,
      };

      // Save the demo order to the database
      const orderData = await Models.orderModel.create(demoOrder);

      // Return success response with title
      res.status(201).json({
        success: true,
        message: "Demo order created successfully",
        title: title, // Send the title
        order: orderData, // Send the created order data in the response
      });
    } catch (error) {
      console.error("Error creating demo order:", error);
      res.status(500).json({
        success: false,
        message: "Error creating demo order",
      });
    }
  },

  makeOrderActive: async (req, res) => {
    try {
      // Get the order ID (_id) from the request body
      const { _id } = req.body;

      // Find the order by ID using Mongoose's findById method
      const order = await Models.orderModel.findById(_id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Define the title (only for response purposes)
      const title = "Make Order Active";

      // Update the order status to 'active' (status code 2)
      order.status = 2; // 2 could represent 'Active'
      await order.save();

      // Return success response with title and updated order data
      res.status(200).json({
        success: true,
        message: "Order is now active",
        title: title, // Send the title
        order: order, // Send the updated order data
      });
    } catch (error) {
      console.error("Error making order active:", error);
      res.status(500).json({
        success: false,
        message: "Error making order active",
      });
    }
  },

  // Mark Order as Delivered
  markOrderDelivered: async (req, res) => {
    try {
      const { _id } = req.body; // Get order ID from request body

      // Find the order by ID using Mongoose's findById method
      const order = await Models.orderModel.findById(_id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Define the title (only for response purposes)
      const title = "Mark Order Delivered";

      // Update the order status to 'delivered' (status code 3)
      order.status = 3; // 3 could represent 'Delivered'
      order.orderDeliveredDate = new Date();
      order.orderDeliveredTime = new Date();
      await order.save();

      // Return success response with title and updated order data
      res.status(200).json({
        success: true,
        message: "Order marked as delivered",
        title: title, // Send the title
        order: order, // Send the updated order data
      });
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      res.status(500).json({
        success: false,
        message: "Error marking order as delivered",
      });
    }
  },

  // Cancel Order with a Reason
  cancelOrder: async (req, res) => {
    try {
      const { _id, cancelReason } = req.body; // Get order ID and cancel reason from request body

      // Find the order by ID using Mongoose's findById method
      const order = await Models.orderModel.findById(_id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Define the title (only for response purposes)
      const title = "Cancel Order";

      // Update the order status to 'cancelled' (status code 4) and add cancel reason
      order.status = 4; // 4 could represent 'Cancelled'
      order.cancelReason = cancelReason || "Customer requested cancellation"; // Use provided cancel reason or default
      await order.save();

      // Return success response with title and updated order data
      res.status(200).json({
        success: true,
        message: "Order has been cancelled",
        title: title, // Send the title
        order: order, // Send the updated order data
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({
        success: false,
        message: "Error cancelling order",
      });
    }
  },





  createRestaurant: async (req, res) => {
    try {
      // Define the title (only for response purposes)
      const title = "Create Demo Restaurant";
  
      // Static data for demo restaurant
      const demoRes = {
        userId: "6753fd42efe5fd5b8963a3b8", // Replace with a valid ObjectId if needed
        name: "3B2 Restaurant",
        image: "/images/5655530d-1d85-4042-9ec0-de07bbc0943a.jpg",
        address: "123 Example Street, City, Country",
        location: {
          type: "Point",
          coordinates: [77.5946, 12.9716], // Longitude, Latitude (example: Bangalore, India)
        },
        category: [
          {
            name: "Indian Cuisine",
            image: "/images/5655530d-1d85-4042-9ec0-de07bbc0943a.jpg",
            status: 1,
          },
          {
            name: "Chinese Cuisine",
            image: "/images/5655530d-1d85-4042-9ec0-de07bbc0943a.jpg",
            status: 1,
          },
        ],
        subCategory: [
          {
            name: "Biryani",
            image: "/images/5655530d-1d85-4042-9ec0-de07bbc0943a.jpg",
            categoryId: "6755ad29e06a54c71363062a", // Replace with a valid ObjectId
            status: 1,
          },
          {
            name: "Noodles",
            image: "/images/5655530d-1d85-4042-9ec0-de07bbc0943a.jpg",
            categoryId: "6755ad29e06a54c71363062a", // Replace with a valid ObjectId
            status: 1,
          },
        ],
        products: [
          {
            subCategoryId: "6755ae955c9411210bb36d0e", // Replace with a valid ObjectId
            images: [
              "/images/5655530d-1d85-4042-9ec0-de07bbc0943a.jpg",
              "/images/5655530d-1d85-4042-9ec0-de07bbc0943a.jpg",
            ],
            itemName: "Hyderabadi Biryani",
            price: "12.99",
            size: "Large",
            status: 1,
          },
          {
            subCategoryId: "6755ae955c9411210bb36d0e", // Replace with a valid ObjectId
            images: ["/images/5655530d-1d85-4042-9ec0-de07bbc0943a.jpg"],
            itemName: "Hakka Noodles",
            price: "8.99",
            size: "Medium",
            status: 1,
          },
        ],
        staffs: ["6753fd42efe5fd5b8963a3b8", "675449f250481a79e5d4ee95"], // Replace with valid ObjectIds
        openingTime: "09:00 AM",
        closingTime: "11:00 PM",
      };
  
      // Create restaurant in the database
      const resData = await Models.restaurantModel.create(demoRes);
  
      // Return success response
      res.status(201).json({
        success: true,
        message: "Demo restaurant created successfully",
        data: resData,
      });
    } catch (error) {
      console.error("Error creating demo restaurant:", error);
      res.status(500).json({
        success: false,
        message: "Error creating demo restaurant",
      });
    }
  },
  
  
  testRestaurant : async(req, res)=>{
    try {
      let objToSave = {
        userId: "676662bdb0f809a8a679e045",
        name: "chai tapri",
      }

      let data = await Models.restaurantModel.create(objToSave);
      res.json(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },



  updateRestaurant: async (req, res) => {
    try {
      const { restaurantId } = req.body;
  
      // Static data with random online images
      const staticData = {
        userId: "675449f250481a79e5d4ee95",
        // image: "https://picsum.photos/200/300?random=1", // Random restaurant image
        address: "456 Updated Street, New City",
        category: [
          { type: "Fast Food",
            //  image: "https://picsum.photos/200/300?random=2"
             },
          { type: "Dessert",
            //  image: "https://picsum.photos/200/300?random=3"
             },
        ],
        subCategory: [
          { type: "Pizza",
            //  image: "https://picsum.photos/200/300?random=4" 
            },
          { type: "Ice Cream",
            //  image: "https://picsum.photos/200/300?random=5"
             },
        ],
        staffs: ["675449f250481a79e5d4ee95", "6753fd42efe5fd5b8963a3b8"],
        openingTime: "09:00 AM",
        closingTime: "11:00 PM",
      };
  
      // Find the restaurant by ID
      const restaurant = await Models.restaurantModel.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found",
        });
      }
  
      // Update only the specified fields
      restaurant.userId = staticData.userId;
      restaurant.image = staticData.image;
      restaurant.address = staticData.address;
      restaurant.category = staticData.category;
      restaurant.subCategory = staticData.subCategory;
      restaurant.staffs = staticData.staffs;
      restaurant.openingTime = staticData.openingTime;
      restaurant.closingTime = staticData.closingTime;
  
      // Save the updated restaurant
      const updatedRestaurant = await restaurant.save();
  
      // Return success response
      res.status(200).json({
        success: true,
        message: "Restaurant updated successfully",
        restaurant: updatedRestaurant,
      });
    } catch (error) {
      console.error("Error updating restaurant:", error);
      res.status(500).json({
        success: false,
        message: "Error updating restaurant",
      });
    }
  },
  
  
  


  createCategory: async (req, res) => {
    try {
      const userId = "6753fd42efe5fd5b8963a3b8"; // Replace with a valid ObjectId from your users collection
  
      const testCategories = [
        { userId, name: "Fast Food", image: "/images/fc524550-9222-4931-a84a-896e34ebad64.jpg", status: 1 },
        { userId, name: "Desserts", image: "/images/fc524550-9222-4931-a84a-896e34ebad64.jpg", status: 1 },
        { userId, name: "Beverages", image: "/images/fc524550-9222-4931-a84a-896e34ebad64.jpg", status: 1 },
      ];
  
      const categories = await Models.restaurantModel.insertMany(testCategories);
  
      res.status(201).json({
        success: true,
        message: "Test categories created successfully",
        categories,
      });
    } catch (error) {
      console.error("Error creating test categories:", error);
      res.status(500).json({
        success: false,
        message: "Error creating test categories",
      });
    }
  },
  
  


  createSubCategory: async (req, res) => {
    try {
      // Define a static userId
      const userId = "6753fd42efe5fd5b8963a3b8"; // Replace with your static userId
  
      // Fetch available categories from the correct model
      const categories = await Models.restaurantModel.find(); // Fetch categories from the appropriate collection
      if (!categories || categories.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No categories found. Please create categories first.",
        });
      }
  
      // Generate subcategories for each category
      const testSubCategories = categories.flatMap((category, index) => [
        {
          name: `${category.name} - Item ${index + 1}`,
          image: "/images/fc524550-9222-4931-a84a-896e34ebad64.jpg",
          categoryId: category._id,
          userId, // Static userId
          status: 1,
        },
        {
          name: `${category.name} - Item ${index + 2}`,
          image: "/images/fc524550-9222-4931-a84a-896e34ebad64.jpg",
          categoryId: category._id,
          userId, // Static userId
          status: 1,
        },
      ]);
  
      // Insert subcategories into the database using the correct model
      const subCategories = await Models.restaurantModel.insertMany(testSubCategories);
  
      res.status(201).json({
        success: true,
        message: "Test subcategories created successfully",
        subCategories,
      });
    } catch (error) {
      console.error("Error creating test subcategories:", error);
      res.status(500).json({
        success: false,
        message: "Error creating test subcategories",
      });
    }
  },
  
  
  
  
  restaurantProduct:async(req,res)=>{
    try {
      let objToUpdate = [
        {
          subCategoryId: "6755aeede7becf5dcd7c0782",
          images: ["/images/b0863955-94c8-43dc-bd68-2cfbbdd1f04c.jpg", "/images/fc524550-9222-4931-a84a-896e34ebad64.jpg"], // Example images
          itemName: "Sample",
          price: "100",
          size: "Large",
          status: 1,
          description:"Sample Item quantity"
        },
        {
          subCategoryId: "6755aeede7becf5dcd7c0783",
          images: ["/images/975fe7ab-ddf8-4f64-82d1-669f3d3035dd.jpeg", "/images/fc524550-9222-4931-a84a-896e34ebad64.jpg"], // Example images
          itemName: "Sample Item",
          price: "100",
          size: "Small",
          status: 1,
          description:"Sample Item Description"
        },
        {
          subCategoryId: "6755aeede7becf5dcd7c0782",
          images: ["/images/b0863955-94c8-43dc-bd68-2cfbbdd1f04c.jpg", "/images/fc524550-9222-4931-a84a-896e34ebad64.jpg"], // Example images
          itemName: "Test",
          price: "10",
          size: "XL",
          status: 1,
          description:"Test description"
        },
        {
          subCategoryId: "6755aeede7becf5dcd7c0783",
          images: ["/images/975fe7ab-ddf8-4f64-82d1-669f3d3035dd.jpeg", "/images/fc524550-9222-4931-a84a-896e34ebad64.jpg"], // Example images
          itemName: "Sample Item",
          price: "100",
          size: "Small",
          status: 1,
          description:"Sample Item"
        },
      ];

      await Models.restaurantModel.updateOne(
        { _id: "6755aeede7becf5dcd7c077f" },
        { $push: { products: { $each: objToUpdate } } } // Use $each to add multiple items
      );
      return true
    } catch (error) {
      throw error
    }
  },

  rideBook:async(req,res)=>{
    try {
      const dummyRideBookings = [
        {
          userId: "6753fd42efe5fd5b8963a3b8", // Replace with valid user IDs from your "user" collection
          riderId: "675150c86b2e0e72def70281", // Replace with valid rider IDs from your "user" collection
          userLocation: {
            location: "User's starting location",
            coordinates: [77.1234, 28.5678],
          },
          destinationLocation: {
            location: "Destination location",
            coordinates: [77.5678, 28.1234],
          },
          riderLocation: {
            location: "Rider's current location",
            coordinates: [77.4321, 28.8765],
          },
          status: 1, // Pending
          reasonOfCancelation: "",
          riderFair: 200,
          adminCommission: 20,
          totalDistance: "15 km",
          totalTimeTaken: "30 mins",
          extraCharges: 10,
        },
        {
          userId: "675449f250481a79e5d4ee95",
          riderId: "675150c86b2e0e72def70281",
          userLocation: {
            location: "Another user's location",
            coordinates: [77.3333, 28.6666],
          },
          destinationLocation: {
            location: "Another destination",
            coordinates: [77.4444, 28.7777],
          },
          riderLocation: {
            location: "Another rider's location",
            coordinates: [77.5555, 28.8888],
          },
          status: 3, // Ongoing
          reasonOfCancelation: "",
          riderFair: 250,
          adminCommission: 25,
          totalDistance: "20 km",
          totalTimeTaken: "40 mins",
          extraCharges: 15,
        },
        {
          userId: "674edd5e0594874f497bc8df",
          riderId: "675150c86b2e0e72def70281",
          userLocation: {
            location: "Yet another user's location",
            coordinates: [77.4444, 28.9999],
          },
          destinationLocation: {
            location: "Yet another destination",
            coordinates: [77.5555, 28.1111],
          },
          riderLocation: {
            location: "Yet another rider's location",
            coordinates: [77.6666, 28.2222],
          },
          status: 4, // Complete
          reasonOfCancelation: "",
          riderFair: 300,
          adminCommission: 30,
          totalDistance: "25 km",
          totalTimeTaken: "50 mins",
          extraCharges: 20,
        },
      ];
      await Models.rideBookingModel.create(dummyRideBookings)
      return true
    } catch (error) {
      throw error 
    }
  }
  
};
