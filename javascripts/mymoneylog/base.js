/**
 * base.js - provides some base functions
 * @author Ricardo Nishimura - 2008
 */
var mlog = mlog || {};
mlog.translation = mlog.translation || {};

mlog.base = function() {
    //private
    /**
     * @author wallace
     */
    var CloudSaveFile = function(fileName, content, callback) {
        mlog.base.showLoading();

        client.filesUpload({
            path: '/' + fileName,
            contents: content,
            mode: {
                '.tag': 'overwrite'
            },
            autorename: false
        }).then(function(FilesFileMetadata) {
            mlog.base.success(callback, undefined, 'data saved succesfully!');
            console.log("File saved as revision " + FilesFileMetadata.rev);
        }).catch(mlog.base.catchError);
        return true;
    };

    // public:
    return {
        /* begin config parameters */
        dataFieldSeparator: '\t',
        dataRecordSeparator: /[\n\r]+/,
        categorySeparator: '; ',
        dataFileName: 'data.txt',
        hideLoading: function() {
            $.modal.close();
        },
        showLoading: function() {
            $.modal.close();
            $("#ajaxLoading").modal({
                containerId: 'ajaxLoadingModal'
            });
        },
        success: function(callback, params, message, messageTimeout) {
            mlog.base.hideLoading();
            if (message != undefined) {
                if (messageTimeout == undefined) {
                    notification.showSuccess(message);
                } else {
                    notification.showSuccess(message, undefined, messageTimeout);
                }
            }
            if (typeof callback == "function") {
                callback(params);
            }
        },
        catchError: function(error) {
            mlog.base.hideLoading();
            return mlog.base.error({
                error: error,
                message: mlog.translator.msg('unknown error')
            });
        },
        error: function(error, callback, params) {
            mlog.base.hideLoading();
            console.log(error);
            console.log('message:' + error.message);
            notification.showError(error.message);
            if (typeof callback == "function") {
                callback(params);
            }
        },
        getFile: function(fileName, callback) {
            mlog.base.showLoading();
            client.filesDownload({
                path: '/' + mlog.base.dataFileName
            }).then(function(data) {
                mlog.base.hideLoading();
                var blob = data.fileBlob;
                var reader = new FileReader();
                reader.addEventListener("loadend", function() {
                    //console.log(reader.result); // will print out file content
                    mlog.base.success(callback, reader.result);
                });
                reader.readAsText(blob);
            }).catch(mlog.base.catchError);
        },
        saveFile: function(fileName, content, callBack) {
            fileName = decodeURI(fileName);
            return CloudSaveFile(fileName, content, callBack);
        },
        // sort array by an index
        arraySort: function(theArray, colIndex) {
            var i = colIndex || 0;
            /* sort one index */
            var sortOne = function(va, vb, vi) {
                var a = va[vi];
                var b = vb[vi];
                try {
                    if (typeof a == 'string') {
                        a = a.toLowerCase();
                        b = b.toLowerCase();
                    }
                    if (a < b) {
                        return -1;
                    } else
                    if (a > b) {
                        return 1;
                    }
                } catch (er) {}
                return 0;
            };
            /* sort two index: if first is equal, try next index */
            var sortTwo = function(va, vb) {
                var res = sortOne(va, vb, i);
                if ((res === 0) && (va.length > i + 1)) {
                    return sortOne(va, vb, i + 1);
                }
                return res;
            };
            theArray.sort(sortTwo);
        },
        /* format float as localized currency string*/
        floatToString: function(num) {
            num = num.toFixed(2).replace('.', mlog.translation.centschar);
            while (num.search(/[0-9]{4}/) > -1) {
                num = num.replace(/([0-9])([0-9]{3})([^0-9])/, '$1' + (mlog.translation.thousandchar || ',') + '$2$3');
            }
            return num;
        },
        /* format float and stylize to currency */
        formatFloat: function(num) {
            var myClass = (num < 0) ? 'neg' : 'pos';
            return '<span class="' + myClass + '">' + mlog.base.floatToString(num) + '<\/span>';
        },
        toFloat: function(str) {
            var num = str;
            num = num || '0';
            num = num.replace(/[^0-9.,+-]/g, '');
            num = num.replace(/([.,]([0-9])$|[.,]([0-9][0-9])$)/, '@$1');
            num = num.replace(/[^0-9@+-]/g, '');
            num = parseFloat(num.replace('@', '.'));
            return num;
        },
        /* add n months to a date */
        addMonths: function(dt, nMonth) {
            var res = new Date(dt);
            res.setHours(1); // avoid daylight saving calc
            res.setMonth(dt.getMonth() + nMonth);
            if (res.getDate() < dt.getDate()) {
                res.setDate(1);
                res.setDate(res.getDate() - 1);
            }
            return res;
        },
        /* parse 'YYYY-mm-dd' to date */
        stringToDate: function(str) {
            return new Date(str.replace(/-/g, '/'));
        },
        /* convert date to 'YYYY-mm-dd' string format */
        dateToString: function(dt) {
            var m = dt.getMonth() + 1;
            m = (m < 10) ? ("0" + m) : m;
            var d = dt.getDate();
            d = (d < 10) ? ("0" + d) : d;
            return dt.getFullYear() + '-' + m + '-' + d;
        },
        getCurrentDate: function() {
            return this.dateToString(new Date());
        },
        /* activate a menu tab and its sidebar panel*/
        activateMenu: function(menuId) {
            var menu = $('#menu_' + menuId);
            // verify if it is already active
            if (!menu || menu.hasClass('menu_current')) {
                return;
            }
            // deactivate all
            $('#header li').removeClass('menu_current');
            $('#sidebar .panel').hide();
            // activate one menu
            menu.addClass('menu_current');
            // show toolbar items
            $('#panel_' + menuId).show();
            // remove any tooltip
            mlog.base.removeTooltip();
        },
        stripTags: function(str) {
            return str.replace(/<\/?[^>]+>/gi, '');
        },
        setCookie: function(c_name, value, expiredays) {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + (expiredays || 60));
            document.cookie = c_name + "=" + escape(value) + ";expires=" + exdate.toGMTString();
        },
        getCookie: function(c_name) {
            if (document.cookie.length > 0) {
                var c_start = document.cookie.indexOf(c_name + "=");
                if (c_start != -1) {
                    c_start = c_start + c_name.length + 1;
                    var c_end = document.cookie.indexOf(";", c_start);
                    if (c_end == -1) {
                        c_end = document.cookie.length;
                    }
                    return unescape(document.cookie.substring(c_start, c_end));
                }
            }
            return "";
        },
        require: function(libraryName) {
            // inserting via DOM fails in Safari 2.0, so brute force approach
            // borrowed from scriptaculous
            document.write('<script type="text/javascript" src="' + libraryName + '"><\/script>');
        },
        setLocale: function() {
            var newLocale = $('#select_locales option:selected').attr('value');
            if (mlog.translator.getLocaleId() != newLocale) {
                // set new locale in a cookie for 3 years
                this.setCookie('localeId', newLocale, 360 * 3);
                // fade out and reload page
                $('body').fadeOut('normal', function() {
                    window.location.href = window.location.href;
                });
            }
        },
        /* format array as tag cloud string
         * @param: array arrayTags - where index 0 is the tag name
         * @param: int indexCount - index of tag name's count, default: 1
         */
        arrayToTagCloud: function(arrayTags, indexCount) {
            var indexQtd = indexCount || 1;
            var cList = arrayTags;
            var minCount = 999999;
            var maxCount = 0;
            var minSize = 9; // min font size in pixel
            var maxSize = 29; // max font size in pixel
            var fontSize = minSize;
            cList.sort();
            /* iterate to get min and max */
            $.each(cList, function(i, v) {
                if (v[indexQtd] > maxCount) {
                    maxCount = v[indexQtd];
                }
                if (v[indexQtd] < minCount) {
                    minCount = v[indexQtd];
                }
            });
            var list = '';
            for (var i = 0; i < cList.length; i++) {
                if (maxCount > 2) {
                    fontSize = (((cList[i][indexQtd] - minCount) * (maxSize - minSize)) / (maxCount - minCount)) + minSize;
                } else {
                    fontSize = minSize;
                }
                list += '<span class="tagCloud" style="font-size: ' + fontSize +
                    'px" onclick="mlog.base.toggleTag(this)">' + cList[i][0] + '</span> ';
            }
            return list;
        },
        toggleTag: function(elem) {
            $(elem).toggleClass('tagSelect');
        },
        toggleAllTagCloud: function(el) {
            var elem = $(el);
            mlog.base.toggleTag(elem);
            var chk = elem.hasClass("tagSelect");
            $.each(elem.next().children(), function(i, v) {
                $(v).removeClass("tagSelect");
                if (chk) $(v).addClass("tagSelect");
            });
        },
        showTooltip: function(x, y, contents) {
            $('#tooltip').css({
                top: y + 5,
                left: x + 10
            }).html(contents).fadeIn(200);
        },
        removeTooltip: function() {
            $('#tooltip').hide();
        },
        drawChart: function(container, dataset, xlabels) {
            // draw
            $.plot($(container),
                dataset, {
                    xaxis: {
                        ticks: xlabels
                    },
                    legend: {
                        margin: 10,
                        noColumns: 2,
                        backgroundOpacity: 0.4
                    },
                    colors: ["#edc240", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed", '#808080',
                        '#808000', '#008080', '#0000FF', '#00FF00', '#800080', '#FF00FF',
                        '#800000', '#FF0000', '#FFFF00', '#FF8C0', '#FFA07A', '#D2691E',
                        '#DDA0DD', '#ADFF2F', '#4B0082', '#FFFFA0', '#00FF7F', '#BDB76B',
                        '#B0C4DE', '#00FFFF', '#008000', '#000080', '#C0C0C0'
                    ],
                    grid: {
                        tickColor: '#fff',
                        backgroundColor: {
                            colors: ["#D5E8F9", '#FFF']
                        },
                        borderColor: '#6297BC',
                        hoverable: true
                    },
                    points: {
                        show: false
                    },
                    lines: {
                        show: true
                    }
                }
            );
        }
    };
}();

/* jquery to setup jscalendar */
$.fn.jscalendar = function() {
    if (this[0] !== undefined) {
        Calendar.setup({
            inputField: this[0].id,
            ifFormat: "%Y-%m-%d",
            weekNumbers: false
        });
    }
    return this;
};

/* jquery to handle enter key on input elem */
$.fn.jumpOnEnterKey = function() {
    if (this !== undefined) {
        this.bind("keypress", function(e) {
            /* handle ENTER key */
            if (e.keyCode == 13) {
                var inputs = $(this).parents("form").eq(0).find(":input:visible");
                var idx = inputs.index(this);
                $(inputs[idx + 1]).focus().select();
                e.stopPropagation();
                return false;
            }
            return true;
        });
    }
    return this;
};
