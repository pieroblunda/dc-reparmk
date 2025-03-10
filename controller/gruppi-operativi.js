
$(function () {
    DeleteGruppoOperativo = function (IdGruppoOperativo) {
        $.ajax({
            url: "/gruppo-operativo/" + IdGruppoOperativo,
            type: "DELETE",
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(JSON.stringify(response.error));
                ShowError(JSON.parse(JSON.stringify(err.message)).Status);

            } else if (response.status == "OK") {
                document.location.href = '/gruppi-operativi/' + $('#idgruppooperativoparent').val();
            }
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {
            
        });
    }
    $('.btn-ok').click(function () {
        
        var isvalidform = true;
        const forms = document.querySelectorAll('.form-control, .form-select')
        Array.from(forms).forEach(form => {
            if (!form.checkValidity()) {
                isvalidform = false;
            }
        })
        /* Save data */
        if (isvalidform) {
            var IdGruppoOperativo = $('#idgruppooperativo').val();
            if (IdGruppoOperativo != '') {
                requestType = "PUT";
            } else {
                requestType = "POST"
            }
            $.ajax({
                url: "/gruppo-operativo/" + IdGruppoOperativo,
                type: requestType,
                data: {
                    IdGruppoOperativoParent: $('#idgruppooperativoparent').val(),
                    Codice: $('#codice').val(),
                    Descrizione: $('#descrizione').val(),
                    Text_IT: $('#Text_IT').val(),
                    Text_GB: $('#Text_GB').val(),
                    IsPublic: $('#rbIsPublic').prop("checked"),
                    IsVisible: $('#rbIsVisible').prop("checked"),
                    Supervisor: $('#supervisor').val()
                },
            }).done(function (response) {
                if (response.status == "ERR") {
                    var err = JSON.parse(response.error);
                    $('.pnl-errors').html(err.message);
                    $('.form-errors').show();
                }
                else if (response.status == "OK") {
                    $('#gruppi-operativi-modal').modal('hide');
                    document.location.href = '/gruppi-operativi/' + $('#idgruppooperativoparent').val();
                }
            })
        }
    });
    $('.gruppi-operativi-new').click(function () {

        $.ajax({
            url: "/attore-risorse/",
            type: "GET",
            data: {},
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(response.error);
                $('.pnl-errors').html(err.message);
                $('.form-errors').show();
            } else if (response.status == "OK") {
                $('#supervisor').empty();
                $('#supervisor').append('<option selected value="">&hellip;</option>')
                $.each(response.data, function (key, risorsa) {
                    if (eval(risorsa.IDAccount) == eval(supervisor)) {
                        var selected = " selected";
                    }
                    $('#supervisor').append('<option ' + selected + ' value="' + risorsa.IDAccount + '">' + risorsa.Nome + ' ' + risorsa.Cognome + '</option>')
                });
                $('#idgruppooperativo').val('');
                $('#codice').val('');
                $('#descrizione').val('');
                $('#Text_IT').val('');
                $('#Text_GB').val('');
                $('#rbIsPublic').prop("checked", false);
                $('#rbIsVisible').prop("checked", false);

                $('#gruppi-operativi-modal').modal('show');
                $('#gruppi-operativi-modal .modal-title').html('<b>Nuovo</b>');
            }
        });
    });
    $('.gruppi-operativi-edit').click(function () {
        /* Load data from Id */
        var IdGruppoOperativo = $(this).data('gruppioperativoid');
        var IdGruppoOperativoParent = $(this).data('gruppioperativoparentid');

        $.ajax({
            url: "/gruppo-operativo/" + IdGruppoOperativo,
            type: "GET",
            data: {},
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(response.error);
                $('.pnl-errors').html(err.message);
                $('.form-errors').show();
                //console.log(err.name);
                //console.log(err.stack);
            } else if (response.status == "OK") {
                $('#idgruppooperativo').val(response.data[0].IDGruppoOperativo);
                $('#idgruppooperativoparent').val(response.data[0].IDGruppoOperativoParent);
                $('#codice').val(response.data[0].Codice);
                $('#descrizione').val(response.data[0].Descrizione);
                $('#Text_IT').val(response.data[0].Text_IT);
                $('#Text_GB').val(response.data[0].Text_GB);
                $('#rbIsPublic').prop("checked", response.data[0].IsPublic);
                $('#rbIsVisible').prop("checked", response.data[0].IsVisible);
                var supervisor = response.data[0].Supervisor;
                $.ajax({
                    url: "/attore-risorse/",
                    type: "GET",
                    data: {},
                }).done(function (response) {
                    if (response.status == "ERR") {
                        var err = JSON.parse(response.error);
                        $('.pnl-errors').html(err.message);
                        $('.form-errors').show();
                    } else if (response.status == "OK") {
                        $('#supervisor').empty();
                        $('#supervisor').append('<option selected value="">&hellip;</option>')
                        $.each(response.data, function (key, risorsa) {
                            if (eval(risorsa.IDAccount) == eval(supervisor)) {
                                var selected = " selected";
                            }
                            $('#supervisor').append('<option ' + selected + ' value="' + risorsa.IDAccount + '">' + risorsa.Nome + ' ' + risorsa.Cognome + '</option>')
                        });
                    }
                }).fail(function (xhr, status, errorThrown) {
                }).always(function (xhr, status) {

                });
                //$.each(response.data, function (key, product) {
                //});
                //VW_ATTORI_RISORSE
            }
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {

        });

        $('#gruppi-operativi-modal').modal('show');
        $('#gruppi-operativi-modal .modal-title').html('<b>' + $(this).data('gruppioperativotext') + '</b>');
    })
    $('.gruppi-operativi-delete').click(function () {
        /* Delete data from Id */
        var IdGruppoOperativo = $(this).data('gruppioperativoid');
        var IdGruppoOperativoParent = $(this).data('gruppioperativoparentid');

        $.ajax({
            url: "/gruppo-operativo/" + IdGruppoOperativo,
            type: "DELETE",
            data: {},
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(response.error);
                $('.pnl-errors').html(err.message);
                $('.form-errors').show();
            } else if (response.status == "OK") {
                document.location.href = '/gruppi-operativi/' + $('#idgruppooperativoparent').val();
            }
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {

        });
    })
})


