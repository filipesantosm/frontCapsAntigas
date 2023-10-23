jQuery(function () {   // browser-sync -w -server
  var dataVencimento = new Date();
  dataVencimento.setDate(dataVencimento.getDate() + 1);
  var novoValor = dataVencimento.toLocaleString('pt-BR', { dateStyle: 'medium' }); // outra opçao: medium, short , long
  $("#CSALDO_boleto_vencimento").text(novoValor);
/*
  $("button[name='CSALDO_add_valor_boleto']").on('click', function () {
    $("button[name='CSALDO_add_valor_boleto']").each(function (index, item) {
      $(this).removeClass("button-active");
    });
    $(this).addClass("button-active");
    $("#CSALDO_valorSelecionadoBoleto").val(this.value);
  });
  */

  $("button[name='CSALDO_add_valor_boleto']").on('click', function () {
    $("button[name='CSALDO_add_valor_boleto']").each(function (index, item) {
      $(this).removeClass("button-active");
      $(this).removeClass("buttonSegmentActive");
      $(this).addClass("buttonSegmentInactive");
    });
    $(this).addClass("button-active");
    $(this).addClass("buttonSegmentActive");
    $(this).removeClass("buttonSegmentInactive");
    $("#CSALDO_valorSelecionadoBoleto").val(this.value);
  });

  // ******* Pagamento por BOLETO BANCARIO ******** //
  //Ação GERAR PAGAMENTO BOLETO
  $('#CSALDO_btn_gerar_boleto').on('click', function () {
    mensagemProcessandoPagamento("Gerando Boleto, aguarde...");

    // Separa a função e disabilita o botão para nao haver mais de um clique
    $('#CSALDO_btn_gerar_boleto').prop("disabled", true);
    $('#CSALDO_btn_gerar_boleto').hide();
    setTimeout(function () {
      gerarBoleto();
    }, 1500);

  });


  $("#CSALDO_link_boleto").on('click', function () {
    app.dialog.alert("Boleto vence em 1 dia útil", 'Atenção..!', function () {
      app.popup.close();
      app.dialog.close();
      app.actions.close();
      var link_boleto = $("#CSALDO_link_hidden").attr('link_boleto');
      var newWin = window.open(link_boleto);
    });
  });



  //  Valida campos, Cadastra o boleto / Bera o Boleto 
  function gerarBoleto() {
    var dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 1);

    var dataVencimento = dataVencimento.toISOString().split('T')[0];
    if ((!$("#CSALDO_valorSelecionadoBoleto").val()) || ($("#CSALDO_valorSelecionadoBoleto").val() == 0)) {
      var valor_boleto = null;

      //app.dialog.alert('Favor selecionar um valor do boleto', 'ops...!');
      app.dialog.close();
      app.preloader.hide();
      app.dialog.alert('Favor selecionar o valor do boleto', null);
      $('#CSALDO_btn_gerar_boleto').prop("disabled", false);
      $('#CSALDO_btn_gerar_boleto').show();
      return false;
    } else {
      var valor_boleto = $("#CSALDO_valorSelecionadoBoleto").val() + '00'; // valores em centavos
    }

    if (pgb == '1') {
      pagamentoBoleto_CadastraBoleto_GetDados(valor_boleto, dataVencimento);
    }
    else if (pgb == '2') {
      geraBoletoEFI(valor_boleto, dataVencimento);
    }
  };


  // ******* FIM Pagamento por BOLETO BANCARIO ******** //
  // Patrick Fim 

});
