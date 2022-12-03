const express = require('express')
const router =express.Router()

const {signup,
    login,
    logout,
    forgotPassword,
    passwordReset,
    getLoggedInUserDetails ,
    changePassword,
    updateUserDetails,
    adminAllUser,
    managerAllUser,
    adminGetSingleUSer,
    adminUpdateOneUser,
    adminDeleteUser} = require('../controller/userController');
const { isLoggedIn ,customRole} = require('../middlewares/user');





router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userdashboard").get(isLoggedIn,getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn,changePassword);
router.route("/userdashboard/update").post(isLoggedIn,updateUserDetails);
router.route("/admin/alluser").get(isLoggedIn,customRole("admin"),adminAllUser);
router.route("/manage/alluser").get(isLoggedIn,customRole("manager"),managerAllUser);
router.route("/admin/user/:id").get(isLoggedIn,customRole("admin"),adminGetSingleUSer);
router.route("/admin/user/:id").put(isLoggedIn,customRole("admin"),adminUpdateOneUser);
router.route("/admin/user/:id").delete(isLoggedIn,customRole("admin"),adminDeleteUser)

module.exports = router;