let allProducts = new Map();

$(document).ready(function () {
    getAllProducts = function (payload = {}, callback) {
        fetch('/product-list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            ...(payload ? { body: JSON.stringify(payload) } : {})
        })
        .then(res => res.json())
        .then(response => {
            fetch('../template/product-list.ejs')
                .then(res => res.text())
                .then(templateString => {
                    const products = response.data || [];
                    const user = response.user;
                    const pagination = response.pagination;

                    products.forEach(p => {
                        allProducts.set(p.product_code || p.CodiceArticolo, p);
                    });

                    $('#load-data')
                        .data('nextOffset', pagination?.next_offset || 0)
                        .toggleClass('hidden', !pagination?.has_next_page);

                    $('.btn-search')
                        .data('offsetRows', pagination?.next_offset || 0);

                    if (products.length && user) {
                        $('.data-container').empty();
                        const products = Array.from(allProducts.values());
                        products.forEach(product => {
                            const partialProduct = ejs.render(templateString, { product, user });
                            $('.data-container').append(partialProduct);
                            
                            const prices = [];
                            product.competitor_prices.forEach(function(comp) {
                                const val = parseFloat(comp.price);
                                if (val > 0) prices.push(val);
                            });
                            const average = prices.length > 0
                                ? (prices.reduce((a, b) => a + b, 0) / prices.length)
                                : 0;
                            $(`#average-competitor-price-${product.CodiceArticolo} strong`).text(average.toFixed(2));
                        });

                        $('.form-control[data-original-value]').on('input', function() {
                            const $input = $(this);
                            const price = parseFloat($input.val()) || 0;
                            const $row = $input.closest('tr');
                            const basePrice = parseFloat($input.data('product-base-price'));
                            const $spanPerc = $row.find('td:eq(2) span');

                            if ($input.attr('id').includes('-Note')) return;

                            if (price > 0 && basePrice > 0) {
                                const perc = ((basePrice * 100 / price) - 100);
                                const percClass = perc < 0 ? 'text-success' : 'text-danger';
                                $spanPerc.text(perc.toFixed(2) + '%')
                                        .removeClass('text-success text-danger')
                                        .addClass(percClass);
                            } else {
                                $spanPerc.text('-').removeClass('text-success text-danger');
                            }

                            const $container = $input.closest('[id^="container-"]');
                            const articleCode = $container.attr('id').replace('container-', '');
                            const prices = [];
                            $container.find(`input[id^="${articleCode}-Prezzo"]`).each(function() {
                                const val = parseFloat($(this).val());
                                if (val > 0) prices.push(val);
                            });
                            const average = prices.length > 0
                                ? (prices.reduce((a, b) => a + b, 0) / prices.length)
                                : 0;
                            $(`#average-competitor-price-${articleCode} strong`).text(average.toFixed(2));
                        });

                        const totalRows = response.pagination?.total;
                        const loadedRows = response.pagination?.next_offset;

                        const formattedTotalRows = totalRows.toLocaleString('it-IT');
                        const formattedLoadedRows = Math.min(loadedRows, totalRows).toLocaleString('it-IT');

                        $('.LoadedRows').html(formattedLoadedRows);
                        $('.RowsCount').html(formattedTotalRows);

                        if (typeof callback === 'function') {
                            callback(user);
                        }
                    }  else {
                        $('.data-container')
                            .empty()
                            .append('<h3 class="text-center">Nessun risultato trovato</h3>');
                    }
                });
        })
        .catch(err => {});
    };
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
            }
            /* Nasconde il loader al termine del caricamento */
            $('.spinner').hide();
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {

        });
    }
    loadSupplier = function (buyerCode) {
        fetch('/fornitori/' + buyerCode, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(response => {
            if (response.status == 'ERR') return;
            if (response.status == 'OK') {
                $('#Supplier').empty();
                $('#Supplier').append(new Option('Tutti', ''));

                const supplierList = [...response.data].sort(function (a, b) {
                    return a.RagioneSocialeFornitore.localeCompare(
                        b.RagioneSocialeFornitore,
                        { sensitivity: 'base' }
                    )
                });

                $.each(supplierList, function (key, fornitore) {
                    $('#Supplier').append(new Option(fornitore.RagioneSocialeFornitore, fornitore.CodiceFornitore));
                });
            }
        })
        .catch(err => {});
    }
    loadCategories = function (buyerCode) {
        fetch('/categoria/' + buyerCode, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.status == 'ERR') return;
            if (data.status == 'OK') {
                $('#Category').empty();
                $('#Category').append(new Option('Tutti', ''));
                $.each(data.data, function (key, fornitore) {
                    $('#Category').append(new Option(fornitore.RagioneSocialeFornitore, fornitore.CodiceFornitore));
                })
            }
        })
        .catch(err => {});
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
    productPriceHistory = function (productCode) {
        /* Visualizza il loader */
        $('.spinner').show();
        fetch('/product-price-history/' + productCode, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(response => {
            if (typeof response == 'object') {
                if (response.status == 'ERR') return;
                if (response.status == 'OK') {
                    var priceHistory = response.data;
                    var elementId = '#product-price-history';
                    $.get('../template/product-price-history.ejs', function (data) {
                        templateString = data;
                        var partialProduct = ejs.render(templateString, { priceHistory });
                        $('#product-price-history-body').empty().html(partialProduct);

                        $('.btn-product-price-history-ok').click(function () {
                            $(elementId).modal('hide');
                        });
                    });
                    $('.product-article-code').html(productCode);
                    $(elementId).modal('show');
                }
            }
            $('.spinner').hide();
        })
        .catch(error => {})
        .finally(() => {
            $('.spinner').hide();
        });
    }
    competitorProductPriceHistory = function (productCode, competitorId) {
        /* Visualizza il loader */
        $('.spinner').show();
        fetch('/competitor-product-price-history/' + productCode + '/' + competitorId, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(response => {
            if (typeof response == 'object') {
                if (response.status == 'ERR') return;
                if (response.status == 'OK') {
                    var competitorPriceHistory = response.data;
                    $.get('../template/product-competitor-price-history.ejs', function (response) {
                        templateString = response;
                        var partialProduct = ejs.render(templateString, { competitorPriceHistory, competitorId });
                        $('#competitor-product-price-history-body').empty().append(partialProduct);

                        $('.btn-product-price-history-ok').click(function () {
                            $('#competitor-price-history').modal('hide');
                        });
                    });
                    $('.product-code').html(productCode);
                    $('#competitor-price-history').modal('show');
                }
            }
            $('.spinner').hide();
        })
        .catch(error => {})
        .finally(() => {    
            $('.spinner').hide();
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
    loadCompetitor = function (payload) {
        fetch('/product-price/' + payload.product_code, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            getAllProducts();
        })
        .catch(error => {});
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
    $(document).on('click', '.btn-competitor-product-price-history', function () {
        competitorProductPriceHistory($(this).data('productCode'), $(this).data('competitorId'));
    });
    $(document).on('click', '.btn-product-price-history', function () {
        productPriceHistory($(this).data('product-article-code'));
    });
    $(document).on('click', '.btn-search', function () {
        const inputValue = $('input[name="withPrice"]:checked').val() === '' ? null : $('input[name="withPrice"]:checked').val();
        const payload = {
            supplier_code: $('#Supplier').val(),
            category_code: $('#Category').val(),
            product_code: $('#CodiceArticolo').val(),
            product_name: $('#NomeProdotto').val(),
            with_price: inputValue,
            // offset_rows: $(this).data('offsetRows'),
            // next_rows: $(this).data('nextRows'),
        };
        fetch('/product-list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            ...(payload ? { body: JSON.stringify(payload) } : {})
        })
        .then(res => res.json())
        .then(response => {
            fetch('../template/product-list.ejs')
                .then(res => res.text())
                .then(templateString => {
                    const products = response.data || [];
                    const user = response.user;
                    const pagination = response.pagination;

                    $('#load-data')
                        .data('nextOffset', pagination?.next_offset || 0)
                        .toggleClass('hidden', !pagination?.has_next_page);

                    $('.btn-search')
                        .data('offsetRows', pagination?.next_offset || 0);

                    if (products.length && user) {
                        $('.data-container').empty();
                        products.forEach(product => {
                            const partialProduct = ejs.render(templateString, { product, user });
                            $('.data-container').append(partialProduct);
                            
                            const prices = [];
                            product.competitor_prices.forEach(function(comp) {
                                const val = parseFloat(comp.price);
                                if (val > 0) prices.push(val);
                            });
                            const average = prices.length > 0
                                ? (prices.reduce((a, b) => a + b, 0) / prices.length)
                                : 0;
                            $(`#average-competitor-price-${product.CodiceArticolo} strong`).text(average.toFixed(2));
                        });

                        $('.form-control[data-original-value]').on('input', function() {
                            const $input = $(this);
                            const price = parseFloat($input.val()) || 0;
                            const $row = $input.closest('tr');
                            const basePrice = parseFloat($input.data('product-base-price'));
                            const $spanPerc = $row.find('td:eq(2) span');

                            if ($input.attr('id').includes('-Note')) return;

                            if (price > 0 && basePrice > 0) {
                                const perc = ((basePrice * 100 / price) - 100);
                                const percClass = perc < 0 ? 'text-success' : 'text-danger';
                                $spanPerc.text(perc.toFixed(2) + '%')
                                        .removeClass('text-success text-danger')
                                        .addClass(percClass);
                            } else {
                                $spanPerc.text('-').removeClass('text-success text-danger');
                            }

                            const $container = $input.closest('[id^="container-"]');
                            const articleCode = $container.attr('id').replace('container-', '');
                            const prices = [];
                            $container.find(`input[id^="${articleCode}-Prezzo"]`).each(function() {
                                const val = parseFloat($(this).val());
                                if (val > 0) prices.push(val);
                            });
                            const average = prices.length > 0
                                ? (prices.reduce((a, b) => a + b, 0) / prices.length)
                                : 0;
                            $(`#average-competitor-price-${articleCode} strong`).text(average.toFixed(2));
                        });

                        const totalRows = response.pagination?.total;
                        const loadedRows = response.pagination?.next_offset;

                        const formattedTotalRows = totalRows.toLocaleString('it-IT');
                        const formattedLoadedRows = Math.min(loadedRows, totalRows).toLocaleString('it-IT');

                        $('.LoadedRows').html(formattedLoadedRows);
                        $('.RowsCount').html(formattedTotalRows);

                        if (typeof callback === 'function') {
                            callback(user);
                        }
                    } else {
                        $('.data-container')
                            .empty()
                            .append('<h3 class="text-center">Nessun risultato trovato</h3>');
                    }
                });
        })
        .catch(err => {});
    });
    $('#load-data').click(function () {
        const nextOffset = $(this).data('nextOffset') || 0;
        /* Carica la lista dei risultati */
        getAllProducts({
            supplier_code: $('#Supplier').val(),
            category_code: $('#Category').val(),
            product_code: $('#CodiceArticolo').val(),
            product_name: $('#NomeProdotto').val(),
            with_price: $('input[name="withPrice"]:checked').val(),
            offset_rows: nextOffset,
            next_rows: nextOffset,
        });
    });
    $('.btn-download-excel').click(function () {
        var $btn = $(this);
        var originalText = $btn.html();
        $btn.html("<i class='bi bi-arrow-repeat spin'></i> Loading...").prop('disabled', true);

        fetch('/download-excel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                supplier_code: $('#Supplier').val(),
                category_code: $('#Category').val(),
                product_code: $('#CodiceArticolo').val(),
                product_name: $('#NomeProdotto').val(),
                with_price: $('input[name="withPrice"]:checked').val(),
                offset_rows: $(this).data('offsetRows'),
                next_rows: $(this).data('nextRows'),
            })
        })
        .then(res => res.blob())
        .then(blob => {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'report.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            $btn.html(originalText).prop('disabled', false);
        })
        .catch(() => {
            $btn.html(originalText).prop('disabled', false);
        });
    });
    $(document).on('click', '.btn-submit-changes', function () {
        var $container = $(this).closest('[id^="container-"]');
        var productArticleCode = $container.attr('id').replace('container-', '');
        var $infoTesting = $('#' + productArticleCode + '-testing').val() || null;
        var $infoPackaging = $('#' + productArticleCode + '-packaging').val() || null;
        var $infoSuggested = $('#' + productArticleCode + '-suggested-price').val() || 0.00;
        var competitorData = [];

        $container.find('tbody tr#competitor-info-' + productArticleCode).each(function() {
            var $row = $(this);
            var competitorName = $row.find('[data-competitor-name]').data('competitor-name') || null;
            var competitorProductId = $row.find('[data-competitor-product-id]').data('competitor-product-id') || null;
            var url = $('#competitor-name-link-' + competitorProductId).data('competitor-product-url') || null;

            var $priceInput = $row.find('input[id^="' + productArticleCode + '-Prezzo' + competitorName + '"]');
            var price = $priceInput.val();

            var $noteInput = $row.find('input[placeholder="Note"]');
            var note = $noteInput.val();

            competitorData.push({
                competitor_product_id: competitorProductId,
                price: price,
                note: note,
                url: url,
            });
        });

        loadCompetitor({
            product_code: productArticleCode,
            packaging_info: $infoPackaging,
            testing_info: $infoTesting,
            competitor_price: competitorData,
            suggested_price: $infoSuggested,
        });
    });
    $(document).on('click', '.btn-competitor-url', function () {
        var productUrl = $(this).data('competitor-product-url');
        var competitorProductId = $(this).next().data('competitor-product-id');
        var elementId = '#product-competitor-url';
        $.get('../template/product-competitor-url.ejs', function (response) {
            templateString = response;
            var partialProduct = ejs.render(templateString, { productUrl });
            $('#competitor-url-body').empty().html(partialProduct);

            $('.btn-competitor-url-ok').click(function () {
                var competitorUrl = $('#new-competitor-url').val();
                if (competitorUrl) {
                    const $label = $('#competitor-name-label-' + competitorProductId);
                    const $link  = $('#competitor-name-link-' + competitorProductId);

                    $label.toggleClass('hidden');
                    $link
                        .toggleClass('hidden')
                        .attr('href', competitorUrl)
                        .data('competitor-product-url', competitorUrl);

                    $(elementId).modal('hide');
                }
            });
        });

        $(elementId).modal('show');
    });
    $(document).on('input', '.btn-set-suggested-price', function() {
        var suggested = parseFloat($(this).val().replace(',', '.')) || 0;
        var base = parseFloat($(this).data('fornitore-price')) || 0;
        var perc = base > 0 ? ((suggested - base) / base) * 100 : 0;
        var percText = perc.toFixed(2) + '% di ricarico';
        var percClass = perc < 0 ? 'text-danger' : 'text-success';

        var $span = $('#' + $(this).data('product-code') + '-suggested-price-di-ricarico');
        $span.text(percText).removeClass('text-success text-danger').addClass(percClass);
    });
    $('input.number-validation').on('input', function() {
        this.value = this.value.replace(/[^0-9.]/g, '');

        var parts = this.value.split('.');
        if (parts.length > 2) {
            this.value = parts[0] + '.' + parts.slice(1).join('');
        }
    });
    $('input.number-validation').on('blur', function() {
        this.value = this.value.replace(/[^0-9.]/g, '');
        if (this.value === '') {
            this.value = '0.00';
        }
    });
    $(document).on('click', '.zoom-image', function() {
        var src = $(this).attr('src');
        $('#modalImage').attr('src', src);
        $('#imageModal').modal('show');
    });
    //$(window).scroll(function (e) {
    //    if (($(window).scrollTop() + $(window).height()) >= $(document).height()) {
    //        if ($('.LoadedRows').html() != $('.RowsCount').html()) {
    //            loadProducts($('#Fornitore').val(), $('#CodiceArticolo').val());
    //        }
    //    }
    //});
    loadBuyer();
    getAllProducts(null, function (user) {
        loadSupplier(user.Codice);
        loadCategories(user.Codice);
    }); 
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});