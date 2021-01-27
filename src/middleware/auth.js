const jwt = require("jsonwebtoken");
const Userdb = require("../models/User");
const Notification = require("../models/Notification");

exports.Verify = async (req, res, next) => {
    let token;
    if(req.user&&req.user.id){
        Notification.find({}).sort({createdAt:-1}).then((notices)=>{
        console.log(notices);
        notices = notices.filter(function(notice){
            return notice.receiver.includes(req.user.id);
        })
        console.log(notices);
    
    setTimeout(function(){
        req.notices = notices;
},400);
});
    }
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next({
            message: "Please login to continue further",//redirect to login
            statusCode: 403,
            logout:"true"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);        
        const User = await Userdb.findById(decoded.id).select("-password");
        //console.log('\nuser',User);
            if (!User) {
                return next({ message: `No User found for ID ${decoded.id}`,logout:true });
            }

            req.user = User;
            setTimeout(function(){
                next();
            },600)        
    } catch (err) {
        next({
            message: err.message,//redirect to login on frontend
            statusCode: 403,
        });
    }
};