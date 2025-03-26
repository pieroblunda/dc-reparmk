$(document).ready(function () {
    loadBuyer = function () {
        /* Visualizza il loader */
        $('.spinner').show();
        $.ajax({
            url: "/buyer",
            type: "GET",
            data: {},
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(response.error);
                $('.pnl-errors').html(err.message);
                $('.form-errors').show();
            } else if (response.status == "OK") {
                $.each(response.data, function (key, buyer) {
                    $("#Buyer").append(new Option(buyer.Nominativo, buyer.CodiceBuyer));
                })
            }
            /* Nasconde il loader al termine del caricamento */
            $('.spinner').hide();
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {

        });
    }
    loadFornitori = function (CodiceBuyer) {
        /* Visualizza il loader */
        $('.spinner').show();
        $.ajax({
            url: "/fornitori/" + CodiceBuyer,
            type: "GET",
            data: {},
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(response.error);
                $('.pnl-errors').html(err.message);
                $('.form-errors').show();
            } else if (response.status == "OK") {
                $("#Fornitore").empty();
                $("#Fornitore").append(new Option('Tutti', ''));
                $.each(response.data, function (key, fornitore) {
                    $("#Fornitore").append(new Option(fornitore.RagioneSocialeFornitore, fornitore.CodiceFornitore));
                })
            }
            /* Nasconde il loader al termine del caricamento */
            $('.spinner').hide();
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {

        });
    }
    detectPrice = function (codicearticolo) {
        /* Visualizza il loader */
        $('.spinner').show();
        /* Visualizza il tab detail come default */
        $('#nav-tabs-detect-price a[href="#tabpanel-detect-price-detail"]').tab('show');
        $.ajax({
            url: "/product-list/" + codicearticolo,
            type: "GET",
            data: {},
        }).done(function (response) {
            if (typeof response == "object") {
                if (response.status == "ERR") {
                    var err = JSON.parse(response.error);
                    $('.pnl-errors').html(err.message);
                    $('.form-errors').show();
                } else if (response.status == "OK") {
                    var product = JSON.parse(response.data);
                    $.get("../template/product-price-detect-detail.ejs", function (response) {
                        templateString = response;
                        var partialProduct = ejs.render(templateString, { product });
                        $('#tabpanel-detect-price-detail').empty().append(partialProduct);
                        $('.btn-detect-price-ok').click(function () {
                            detectPriceOk($('.CodiceArticolo').html(), product.ArticoloBrands);
                        });
                        $("input.decimal").bind("change keyup input", function () {
                            var position = this.selectionStart - 1;
                            //remove all but number and .
                            var fixed = this.value.replace(/[^0-9\.]/g, "");
                            if (fixed.charAt(0) === ".")
                                //can't start with .
                                fixed = fixed.slice(1);
                            var pos = fixed.indexOf(".") + 1;
                            if (pos >= 0)
                                //avoid more than one .
                                fixed = fixed.substr(0, pos) + fixed.slice(pos).replace(".", "");
                            //cancel sub input string
                            if (fixed.indexOf(".") > 0 && fixed.substr(pos).length > 2)
                                fixed = fixed.substr(0, pos) + '.' + fixed.substr(pos, 2);
                            //set cursor position to end
                            if (this.value !== fixed) {
                                this.value = fixed;
                                this.selectionStart = position + 1;
                                this.selectionEnd = position + 1;
                            }
                        });
                    });
                    $('.CodiceArticolo').html(product.CodiceArticolo);
                    $('#detect-price').modal('show');
                }
            } else if (response.indexOf("Login") > -1) {
                document.location.href = "/login";
            }
            /* Nasconde il loader al termine del caricamento */
            $('.spinner').hide();
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {

        });
    }
    suggestPrice = function (codicearticolo) {
        /* Visualizza il loader */
        $('.spinner').show();
        $('#PrezzoSuggerito').val('');
        $('#Note').val('');
        $.ajax({
            url: "/product-list/" + codicearticolo,
            type: "GET",
            data: {},
        }).done(function (response) {
            if (typeof response == "object") {
                if (response.status == "ERR") {
                    var err = JSON.parse(response.error);
                    $('.pnl-errors').html(err.message);
                    $('.form-errors').show();
                } else if (response.status == "OK") {
                    var product = JSON.parse(response.data);
                    $.get("../template/product-price-suggest-detail.ejs", function (response) {
                        templateString = response;
                        var partialProduct = ejs.render(templateString, { product });
                        $('#tabpanel-suggest-price-detail').empty().append(partialProduct);
                        $('.btn-suggest-price-ok').click(function () {
                            suggestPriceOk($('.CodiceArticolo').html());
                        });
                        $('#rbSuggestPrice').change(function () {
                            if ($("input[name=rbSuggestPrice]").prop("checked")) {
                                $('.btn-suggest-price-ok').removeClass('disabled');
                                $('.form-suggest-price-alert').show();
                            } else {
                                $('.btn-suggest-price-ok').addClass('disabled');
                                $('.form-suggest-price-alert').hide();
                            }
                        });
                        $("input.decimal").bind("change keyup input", function () {
                            var position = this.selectionStart - 1;
                            //remove all but number and .
                            var fixed = this.value.replace(/[^0-9\.]/g, "");
                            if (fixed.charAt(0) === ".")
                                //can't start with .
                                fixed = fixed.slice(1);
                            var pos = fixed.indexOf(".") + 1;
                            if (pos >= 0)
                                //avoid more than one .
                                fixed = fixed.substr(0, pos) + fixed.slice(pos).replace(".", "");
                            //cancel sub input string
                            if (fixed.indexOf(".") > 0 && fixed.substr(pos).length > 2)
                                fixed = fixed.substr(0, pos) + '.' + fixed.substr(pos, 2);
                            //set cursor position to end
                            if (this.value !== fixed) {
                                this.value = fixed;
                                this.selectionStart = position + 1;
                                this.selectionEnd = position + 1;
                            }
                        });
                    });
                    $('.CodiceArticolo').html(product.CodiceArticolo);
                    $('#suggest-price').modal('show');
                }
            } else if (response.indexOf("Login") > -1) {
                document.location.href = "/login";
            }
            /* Nasconde il loader al termine del caricamento */
            $('.spinner').hide();
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {

        });
    }
    loadProducts = function (CodiceFornitore, CodiceArticolo) {
        /* Visualizza il loader */
        $('.spinner').show();
        $.ajax({
            url: "/product-list",
            type: "POST",
            data: {
                CodiceFornitore: CodiceFornitore,
                CodiceArticolo: CodiceArticolo,
                IdStatoApprovazioneArticolo: $('input[name="IdStatoApprovazione"]:checked').val()
            },
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(response.error);
                if (err.message == "Session expired") {
                    document.location.href = "/login";
                } else {
                    $('.LoadedRows').html(0);
                    $('.RowsCount').html(0);
                    $('#load-data').hide();
                    /* Visualizza l'errore */
                    ShowError(err.message);
                    /* Nasconde il loader al termine del caricamento */
                    $('.spinner').hide();
                }
            } else if (response.status == "OK") {
                if (Array.isArray(response.data)) {
                    $.each(response.data, function (key, product) {
                        loadProduct(product);
                    });
                } else {
                    loadProduct(response.data);
                }
                /* Visualizza il numero dei risultati trovati */
                if ((response.user.NextRows + response.user.OffsetRows) > response.rowscount) {
                    $('.LoadedRows').html(response.rowscount);
                } else {
                    $('.LoadedRows').html(response.user.NextRows + response.user.OffsetRows);
                }
                /* Visualizza il numero totale dei risultati */
                $('.RowsCount').html(response.rowscount);

                /* Visualizza il pulsante per caricare altri risultati */
                if ($('.LoadedRows').html() != $('.RowsCount').html()) {
                    $('#load-data').show();
                }
                /* Nasconde il loader al termine del caricamento */
                $('.spinner').hide();
            }
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {

        });
    }
    loadProduct = function (product, user) {
        templateString = '';
        $.get("../template/product-list.ejs", function (response) {
            templateString = response;
            var partialProduct = ejs.render(templateString, { product, user });
            $('.data-container').append(partialProduct);
            $("#container-" + product.CodiceArticolo).find('.btn-detect-price').each(function () {
                $(this).click(function () {
                    detectPrice($(this).data("codicearticolo"));
                });
            })
            $("#container-" + product.CodiceArticolo).find('.btn-suggest-price').each(function () {
                $(this).click(function () {
                    suggestPrice($(this).data("codicearticolo"));
                });
            })
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
            //$("#container-" + product.CodiceArticolo).find('.btn').each(function () {
            //    $(this).tooltip();
            //})
        });
    }
    detectPriceOk = function (CodiceArticolo, ArticoloBrands) {

        var ArticoloBrand = ArticoloBrands.split(",");
        let jsonData = {}
        $.each(ArticoloBrand, function (key, brand) {
            jsonData["Prezzo" + brand.trim()] = $("#Prezzo" + brand.trim()).val();
            jsonData["Note" + brand.trim()] = $("#Note" + brand.trim()).val();
            jsonData["Url" + brand.trim()] = $("#Url" + brand.trim()).val();
        });
        jsonData["CodiceBrand"] = $('#CodiceBrand').val()

        var isvalidform = true;
        const forms = document.querySelectorAll('#tabpanel-detect-price-detail .form-control-detect, #tabpanel-detect-price-detail .form-select-detect')
        Array.from(forms).forEach(form => {
            if (!form.checkValidity()) {
                isvalidform = false;
            }
        })
        $('#tabpanel-detect-price-detail .decimal').each(function () {
            if (eval($(this).val()) == 0) {
                isvalidform = false;
                ShowErrorValidation("Verificare la formattazione dei valori inseriti");
            }
        });
        /* Save data */
        if (isvalidform) {
            $.ajax({
                url: "/detect-price/" + CodiceArticolo,
                type: "POST",
                data: jsonData,
            }).done(function (response) {
                if (response.status == "ERR") {
                    var err = JSON.parse(response.error);
                    $('.pnl-errors').html(err.message.Status);
                    $('.form-errors').show();
                }
                else if (response.status == "OK") {
                    /* Aaggiorna i prezzi nel jumbtron dello specifico articolo */
                    $.each(ArticoloBrand, function (key, brand) {
                        var htmlToAppend = '';
                        if ($("#Url" + brand.trim()).val() != '') {
                            htmlToAppend += '<a target="_blank" href="' + $("#Url" + brand.trim()).val() + '" style="float:right; font-size:16px; margin-left:4px; margin-top:-1px;" class="bi bi-link-45deg" data-bs-toggle="tooltip" data-bs-placement="top" title="Apri il link"></a>';
                        } else {
                            htmlToAppend += '<span style="float:right; font-size:16px; margin-left:4px; margin-top:-1px;" class="bi bi-link-45deg text-white"></span>';
                        }
                        if ($("#Note" + brand.trim()).val() != '') {
                            htmlToAppend += '<span style="float:right;" class="bi bi-info-circle" data-bs-toggle="tooltip" data-bs-placement="top" title="' + $("#Note" + brand.trim()).val() + '"></span>';
                        } else {
                            htmlToAppend += '<span style="float:right;" class="bi bi-info-circle text-white"></span>';
                        }
                        if ($("#Prezzo" + brand.trim()).val() != '') {
                            htmlToAppend += '<span style="float:right; margin-right:10px;" id="' + CodiceArticolo + '-Prezzo' + brand.trim() + '">' + $("#Prezzo" + brand.trim()).val() + '<span class="bi bi-currency-euro"></span></span>';
                        } else {
                            htmlToAppend += '<span style="float:right; margin-right:10px;" id="' + CodiceArticolo + '-Prezzo' + brand.trim() + '">0.00<span class="bi bi-currency-euro"></span></span>';
                        }
                        $('#td-' + CodiceArticolo + '-' + brand.trim()).empty().html(htmlToAppend);
                        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
                        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
                    });
                    $('#detect-price').modal('hide');
                }
            })
        }
    }
    suggestPriceOk = function (CodiceArticolo) {
        var isvalidform = true;
        const forms = document.querySelectorAll('.form-control-suggest')
        Array.from(forms).forEach(form => {
            if (!form.checkValidity()) {
                isvalidform = false;
            }
        })
        $('.decimal').each(function () {
            if (eval($(this).val()) == 0) {
                isvalidform = false;
                ShowErrorValidation("Verificare la formattazione dei valori inseriti");
            }
        });
        /* Save data */
        if (isvalidform) {
            $.ajax({
                url: "/suggest-price/" + CodiceArticolo,
                type: "POST",
                data: {
                    CodiceArticolo: CodiceArticolo,
                    PrezzoSuggerito: $('#PrezzoSuggerito').val(),
                    Note: $('#Note').val(),
                },
            }).done(function (response) {
                if (response.status == "ERR") {
                    var err = JSON.parse(response.error);
                    $('.pnl-errors').html(err.message);
                    $('.form-errors').show();
                }
                else if (response.status == "OK") {
                    /* Aggiorna il pulsante di origine */
                    $('#' + CodiceArticolo + '-btn-suggest-price').addClass('disabled');
                    $('#' + CodiceArticolo + '-StatoArticolo').removeClass('text-primary');
                    $('#' + CodiceArticolo + '-StatoArticolo').addClass('text-secondary');
                    $('#suggest-price').modal('hide');
                }
            })
        }
    }
    detectPriceHistory = function (codicearticolo) {
        /* Visualizza il loader */
        $('.spinner').show();
        $.ajax({
            url: "/detect-price-history/" + codicearticolo + "/" + $('#CodiceBrand').val(),
            type: "GET",
            data: {},
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(response.error);
                $('.pnl-errors').html(err.message);
                $('.form-errors').show();
            } else if (response.status == "OK") {
                var product = JSON.parse(JSON.stringify(response.data));                
                $.get("../template/product-price-detect-history.ejs", function (templateResponse) {
                    templateString = templateResponse;
                    var partialProduct = ejs.render(templateString, { product });
                    $('#tabpanel-detect-price-history').empty().append(partialProduct);
                });
            }
            /* Nasconde il loader al termine del caricamento */
            $('.spinner').hide();
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {

        });
    }
    $('#tab-detect-price-history').click(function () {
        detectPriceHistory($('.CodiceArticolo').html());
    });
    $('.btn-suggest-price-ok').click(function () {
        suggestPriceOk($('.CodiceArticolo').html());
    });
    $('.btn-detect-price').click(function () {
        detectPrice($(this).data("codicearticolo"));
    });
    $('.btn-suggest-price').click(function () {
        suggestPrice($(this).data("codicearticolo"));
    });
    $('#Buyer').change(function () {
        if ($(this).val() == '') {
            $("#Fornitore").empty();
            $("#Fornitore").append(new Option('Tutti', ''));
        } else {
            loadFornitori($('#Buyer').val());
        }
    });
    $('.btn-search').click(function () {
        $.ajax({
            url: '/init',
            type: "POST",
            data: {},
        }).done(function (response) {
            if (response.indexOf("Login") >-1) {
                document.location.href = "/login";
            } else {
                $('#load-data').hide();
                /* Carica la lista dei risultati */
                $('.data-container').empty();
                loadProducts($('#Fornitore').val(), $('#CodiceArticolo').val());
            }
        })
    });
    $('#load-data').click(function () {
        $('#load-data').hide();
        /* Carica la lista dei risultati */
        if ($('.LoadedRows').html() != $('.RowsCount').html()) {
            loadProducts($('#Fornitore').val(), $('#CodiceArticolo').val());
        }
    })
    //$(window).scroll(function (e) {
    //    if (($(window).scrollTop() + $(window).height()) >= $(document).height()) {
    //        if ($('.LoadedRows').html() != $('.RowsCount').html()) {
    //            loadProducts($('#Fornitore').val(), $('#CodiceArticolo').val());
    //        }
    //    }
    //});
    loadBuyer();
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});