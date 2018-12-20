/**
 * init.js - initialize and start myMoneyLog
 * @author Ricardo Nishimura - 2008
 */
var client;
var CLIENT_ID = '3pboozvdveqjvwq';
var TOKEN_ID = 'mymoneylog-dropbox-auth';

var init = {
    loadData: function() {
        mlog.translator.translateDocument();
        notification.events.init();
        client = new Dropbox({
            clientId: CLIENT_ID,
            accessToken: users.getAccessToken(),
        });

        users.init();
    },
    init: function() {
        /* initialize and show entries */
        mlog.entriesControl.show();
        $('#report').show();
        $('#sidebar').show();
        /* initialize menus */
        $('#menu_entries').click(mlog.entriesControl.show);
        $('#menu_categories_overview').click(mlog.categoriesControl.show);
        $('#menu_accounts_overview').click(mlog.accountsControl.show);
        $('#menu_editor').click(mlog.editorControl.show);
        $('#menu_help').click(mlog.helpControl.show);
        $('#logo').click(mlog.entriesControl.show);
        $('#slogan').click(function() {
            open('http://code.google.com/p/mymoneylog/');
        });
        /* initialize datepickers */

        $('.input_date').each(function() {
            $(this).jscalendar();
        });
        /* disable: browser autocomplete and submit action */
        $('#sidebar form').submit(function() {
            return false;
        }).attr('autocomplete', 'off');
        /* key press */
        $('.jump_on_enter_key').each(function() {
            $(this).jumpOnEnterKey();
        });

        $('#input_date').focus();
    }
};

$(document).ready(init.loadData);
