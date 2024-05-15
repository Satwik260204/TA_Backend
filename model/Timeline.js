const mongoose = require("mongoose");

const timeLineSchema = new mongoose.Schema({
    BTech : {
        max:{type: Number, default:7},
        min:{type:Number,default:1},
    },
    MTech : {
        max:{type: Number, default:7},
        min:{type:Number,default:1},
    },
    MS : {
        max:{type: Number, default:7},
        min:{type:Number,default:1},
    },
    MSc : {
        max:{type: Number, default:7},
        min:{type:Number,default:1},
    },
    PhD : {
        max:{type: Number, default:7},
        min:{type:Number,default:1},
    }
  });
  
  module.exports = mongoose.model("TimeLine", timeLineSchema);