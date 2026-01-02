const config = {
    baseURL: 'https://api-oaefuk4eqq-el.a.run.app',
    endpoints: {
        checkUser: '/account/check',
        profile: '/account/profile',
        contactUs: '/contact',
        sendRegistrationEmail: '/send-registration',
        login: '/user/login',
        resetPassword: '/account/reset-password',
        sales: {
            l1member: '/sales/l1member',
            hierarchy: '/sales/hierarchy',
            sales: '/sales/sales',
            allSales: '/sales/all-sales' ,
            colInfo: '/sales/col-info'
        },
        policy: {
            download: '/policy/download'
        }
    }
};

export default config;