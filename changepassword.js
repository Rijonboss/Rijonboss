const bcrypt = require('bcrypt');
const express = require('express');
const { message } = require('../../utils');
const router = express.Router();

module.exports = function ({ isAuthenticated_G, isAuthenticated_P, isVerifyRecaptcha, dashBoardData }) {
        router
                .get("/", isAuthenticated_G, async (req, res) => {
                        res.render('change-password');
                })
                .post("/", isAuthenticated_P, async (req, res) => {
                        if (!await isVerifyRecaptcha(req.body['g-recaptcha-response']))
                                return res.status(400).json({
                                        status: "error",
                                        error: 'CAPTCHA IS NOT VERIFIED',
                                        message: 'Captcha không hợp lệ'
                                });
                        const { old_password, password, password_confirmation } = req.body;
                        if (!await bcrypt.compare(old_password, req.user.password))
                                return res.status(400).json({
                                        status: "error",
                                        error: 'OLD_PASSWORD_IS_NOT_CORRECT',
                                        message: 'Mật khẩu cũ không đúng'
                                });
                        if (password !== password_confirmation)
                                return res.status(400).json({
                                        status: "error",
                                        error: 'PASSWORD_IS_NOT_MATCH',
                                        message: 'Mật khẩu không khớp'
                                });
                        if (password.length < 6)
                                return res.status(400).json({
                                        status: "error",
                                        error: 'PASSWORD_IS_NOT_ENOUGH',
                                        message: 'Mật khẩu phải có ít nhất 6 ký tự'
                                });

                        const hashPassword = bcrypt.hashSync(password, 10);
                        await dashBoardData.set(req.user.email, { password: hashPassword });
                        req.flash('success', {
                                msg: 'Đã thay đổi mật khẩu thành công'
                        });
                        res.send();
                });

        return router;
};
