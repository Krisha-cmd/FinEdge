const config = {
    baseURL: 'https://api-oaefuk4eqq-el.a.run.app',
    endpoints: {
        checkUser: '/user/check',
        profile: '/user/profile',
        contactUs: '/contact',
        sendRegistrationEmail: '/send-registration',
        login: '/user/login',
        resetPassword: '/user/reset-password',
        sales: {
            l1member: '/sales/l1member',
            hierarchy: '/sales/hierarchy',
            sales: '/sales/sales'
        }
    }
};

export default config;