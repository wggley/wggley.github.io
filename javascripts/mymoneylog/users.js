/*
 * @author wallace
 */
var users = {
    callback: undefined,
    init: function() {
        $(document).on(
            'click',
            '#logout',
            users.logOut
        );

        mlog.base.showLoading();
        if (users.isAuthenticated()) {
            client.usersGetCurrentAccount()
                .then(function(UsersFullAccount) {
                    mlog.base.hideLoading();
                    $('#userName span').html(UsersFullAccount.name.display_name);
                    mlog.entries.read(init.init);
                })
                .catch(mlog.base.catchError);
        } else {
            users.doAuthentication();
        }
    },
    doAuthentication: function() {
        var authUrl = '';
        if (window.location.hash != "") {
            authUrl = client.getAuthenticationUrl(window.location.href.split("#")[0]);
        } else {
            authUrl = client.getAuthenticationUrl(window.location.href);
        }
        window.location.href = authUrl + '&force_reapprove=true';
    },
    // If the user was just redirected from authenticating, the urls hash will
    // contain the access token.
    isAuthenticated: function() {
        return !!users.getAccessToken();
    },
    // Parses the url and gets the access token if it is in the urls hash
    getAccessToken: function() {
        var token = localStorage.getItem(TOKEN_ID);
        if (token == null) {
            token = users.parseQueryString(window.location.hash).access_token;
            if (token != null && token != "") {
                localStorage.setItem(TOKEN_ID, "" + token);
            }
            return token;
        }
        return token;
    },
    logOut: function() {
        mlog.base.showLoading();
        $('#userName span').html("");
        localStorage.removeItem(TOKEN_ID);
        client.authTokenRevoke().then(function() {
            mlog.base.hideLoading();
            if (window.location.hash != "") {
                window.location.href = window.location.href.split("#")[0];
            } else {
                window.location.reload();
            }
        }).catch(mlog.base.catchError);
    },
    parseQueryString: function(str) {
        var ret = Object.create(null);

        if (typeof str !== 'string') {
            return ret;
        }

        str = str.trim().replace(/^(\?|#|&)/, '');

        if (!str) {
            return ret;
        }

        str.split('&').forEach(function(param) {
            var parts = param.replace(/\+/g, ' ').split('=');
            // Firefox (pre 40) decodes `%3D` to `=`
            // https://github.com/sindresorhus/query-string/pull/37
            var key = parts.shift();
            var val = parts.length > 0 ? parts.join('=') : undefined;

            key = decodeURIComponent(key);

            // missing `=` should be `null`:
            // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
            val = val === undefined ? null : decodeURIComponent(val);

            if (ret[key] === undefined) {
                ret[key] = val;
            } else if (Array.isArray(ret[key])) {
                ret[key].push(val);
            } else {
                ret[key] = [ret[key], val];
            }
        });

        return ret;
    },
};
