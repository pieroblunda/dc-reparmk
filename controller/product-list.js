$(function () {
    $('.btn-edit-product').click(function () {
        $('#product-list-modal').modal('show');
    });
    $(window).scroll(function () {
        if ($(window).scrollTop() + $(window).height() == $(document).height()) {
            $.ajax({
                url: "/product-list",
                type: "POST",
                data: {},
            }).done(function (response) {
                if (response.status == "ERR") {
                    var err = JSON.parse(response.error);
                    $('.pnl-errors').html(err.message);
                    $('.form-errors').show();
                    //console.log(err.name);
                    //console.log(err.stack);
                } else if (response.status == "OK") {
                    $.each(response.data, function (key, product) {

                        /* badge percentuale sconto */
                        var partialSconto = '';
                        if (product.PercentualeSconto != '0.00') {
                            partialSconto += '<h6 class="rounded" style="position:relative; margin:0; width:52px !important; height:20px !important; padding:4px; padding-left:6px; margin-right:0; float:right; top:-10px; background-color:#0088ff; color:#fff;">';
                            partialSconto += parseFloat(product.PercentualeSconto) + '%';
                            partialSconto += '</h6>';
                        }

                        var partialUnita = '';
                        if (eval(product.QuantitaPacco) != (product.QuantitaBox)) {
                            partialUnita = '<h6 class="text-muted">' + product.QuantitaPacco + ' unit&agrave; / Confezione da ' + product.QuantitaBox + ' PZ</h6>';
                        } else {
                            partialUnita = '<h6 class="text-muted">Confezione da ' + product.QuantitaBox + ' PZ</h6>';
                        }
                        var partialFornitore = '';
                        if (product.CodiceFornitore != '') {
                            partialFornitore = '<h6>' + product.RagioneSocialeFornitore + '</h6>'
                        } else {
                            partialFornitore = 'Fornitore non dispnonibile';
                        }

                        var partialPrezzo = '';
                            partialPrezzo = '' +
                                '<h3 style="color:#0088ff;">&euro;&nbsp;' + product.PrezzoListinoBase + '</h3>' +
                                '<h4>&euro;&nbsp; <span style="text-decoration: line-through;">' + product.PrezzoListinoFornitore + '</span></h4>';

                        var partialProduct = '' +
                        '<div class="col-lg-2 col-md-3 col-sm-6 col-xs-12">' +
                            '<div class="jumbotron" style="padding-left:0; padding-right:0; padding-top:25px; border:2px solid #0088ff; background-color:#fff;">' +
                                '<div class="container-fluid" style="padding:0 !important;">' +
                                    partialSconto +
                                    '<h3 class="glyphicon glyphicon-bookmark" style="position:absolute; left:30px; top:-25px; color:#0088ff;"></h3>' +
                                    '<div class="col-xs-12">' +
                                        '<a href="/productDetail/' + product.CodiceArticolo + '" style="color:#333;">' +
                                            '<img src="https://ik.imagekit.io/dccasa/FOTODC_AGENTI/' + product.CodiceArticolo + '.jpg"' +
                                            'onerror="this.onerror=null; this.src=&apos;images/image.png&apos;;"' +
                                            'class="img-thumbnail" />' +
                                        '</a>' +
                                    '</div>' +
                                    '<div class="col-xs-12">' +
                                        '<h5 style="color:gray;"><span class="glyphicon glyphicon-barcode"></span>&nbsp;&nbsp;' + product.CodiceArticolo + '</h5>' +
                                        '<h6 style="color:#0088ff;"><i>' +
                                            product.DescrizioneSottocategoria +
                                        '</i></h6>' + partialFornitore +
                                        '<h4 class="text-info" style="height:60px !important;">' +
                                            '<a class="text-decoration-none" href="/productDetail/' + product.CodiceArticolo + '">' +
                                                '<b class="text-dark">' + product.Denominazione + '</b>' +
                                            '</a>' +
                                        '</h4>' + 
                                    '</div>' +
                                    '<div class="col-xs-12">' +
                                        '<table class="table table-striped table-sm" style="font-size:11px;">' +
                                            '<tbody>' +
                                                '<tr class="table-dark">' +
                                                    '<td scope="col"><b>DC Group</b></td>' +
                                                    '<td scope="col" class="text-right">' +
                                                        '<b>' + product.PrezzoListinoBase + '<span class="bi bi-currency-euro"></span></b>' +
                                                    '</td>' +
                                                '</tr>' +
                                                '<tr>' +
                                                    '<td scope="col">Fornitore</td>' +
                                                    '<td scope="col" class="text-right">' +
                                                        product.PrezzoListinoFornitore + '<span class="bi bi-currency-euro"></span>' +
                                                    '</td>' +
                                                '</tr>' +
                                                '<tr>' +
                                                    '<td scope="col">Family</td>' +
                                                    '<td scope="col" class="text-right">' +
                                                        product.PrezzoListinoFornitore + '<span class="bi bi-currency-euro"></span>' +
                                                    '</td>' +
                                                '</tr>' +
                                                '<tr>' +
                                                    '<td scope="col">Ilomo</td>' +
                                                    '<td scope="col" class="text-right">' +
                                                        product.PrezzoListinoFornitore + '<span class="bi bi-currency-euro"></span>' +
                                                    '</td>' +
                                                '</tr>' +
                                                '<tr>' +
                                                    '<td scope="col">Sunlux</td>' +
                                                    '<td scope="col" class="text-right">' +
                                                        product.PrezzoListinoFornitore + '<span class="bi bi-currency-euro"></span>' +
                                                    '</td>' +
                                                '</tr>' +
                                            '</tbody>' +
                                        '</table>' +
                                    '</div>' +
                                    '<div class="col-xs-12">' +
                                        '<div class="btn-group dropup" style="position:absolute; display:block; width:100%; z-index:10;">' +
                                            '<button type="button" class="btn btn-default bi bi-three-dots-vertical rounded-circle"' +
                                                'data-bs-toggle="dropdown" style="width:34px; height:34px; padding:0; float:right; margin-right:25px; margin-bottom:8px;">' +
                                            '</button>' +
                                            '<ul class="dropdown-menu dropdown-menu-lg-end" style="width:250px;">' +
                                                '<li>' +
                                                    '<div class="col-xs-12">' +
                                                        '<b class="gruppo-operativo-1">Azioni</b>' +
                                                    '</div>' +
                                                '</li>' +
                                                '<li class="dropdown-item">' +
                                                    '<hr class="dropdown-divider">' +
                                                '</li>' +
                                                '<li class="dropdown-item">' +
                                                    '<button type="button" class="btn btn-light col-xs-12">' +
                                                        'Visualizza dettaglio' +
                                                    '</button>' +
                                                '</li>' +
                                                '<li class="dropdown-item">' +
                                                    '<button type="button" class="btn btn-light col-xs-12">' +
                                                        'Aggiungi in approvazione' +
                                                    '</button>' +
                                                '</li>' +
                                            '</ul>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
                        $('.data-container').append(partialProduct);
                    });
                }
            }).fail(function (xhr, status, errorThrown) {
            }).always(function (xhr, status) {

            });
        }
    });
});