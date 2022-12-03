const BigPromise = require("../middlewares/bigpromise")


exports.home = BigPromise( async (req,res) =>{
    res.status(200).json({
        success : true,
        greeting: "Hello from api"
    })
})


exports.homeDummy = (req,res) =>{
    res.status(200).json({
        success : true,
        greeting: "Hello from another dummy api"
    })
}

