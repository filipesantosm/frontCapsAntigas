jQuery(function () {
  // Se o usuário preencheu algum resultado, retorna com a marcação
  retornaResultadoMarcado();

  $('.bolas_acompanharSorteio').on('click', function () {
    var bola = $(this).attr("value");
    var statusAtualBola = pesquisaStatusBola(bola);
    if (statusAtualBola == 'inativa') {
      atualizaBolasMarcadas('add', bola);
      $(this).attr("b_status", 'ativa');
      $(this).addClass("circulo-preferido");
      $(this).removeClass("circulo-apagado");
    }
    else {
      atualizaBolasMarcadas('rem', bola);
      $(this).attr("b_status", 'inativa');
      $(this).addClass("circulo-apagado");
      $(this).removeClass("circulo-preferido");
    }
    atualizaBolasTitulos(bola, statusAtualBola);

  });

  function retornaResultadoMarcado() {
    var AS_sorteioSelecionado = "S" + $("#AS_sorteioSelecionado").val();
    if (localStorage.getItem("AS_bolasMarcadas")) {
      var JSONbolasMarcadas = JSON.parse(localStorage.getItem("AS_bolasMarcadas"));
      var retorno = 'inativa';
      $.each(JSONbolasMarcadas, function (index, value) {
        if (index == AS_sorteioSelecionado) {
          var bolasMarcadasArray = value.split(';');
          bolasMarcadasArray.forEach(function (bolaSelecionada, i) {
            $("div[name='bolas_resultado']").each(function (index, item) {
              var bola = $(this).attr("value");
              if (bola == bolaSelecionada) {
                $(this).addClass("circulo-preferido");
                $(this).removeClass("circulo-apagado");
              }
            });
            $("div[name='AS_bola_titulo']").each(function (index, item) {
              var bola = $(this).text();
              if (bola == bolaSelecionada) {
                $(this).addClass("circulo-preferido");
                $(this).removeClass("circulo");
              }
            });
          });
        }
      });
    }
  }

  function atualizaBolasTitulos(bola, statusAtualBola) {
    var tipoSorteio = $("#AS_tipo_sorteio").val();
    $("div[name='AS_bola_titulo']").each(function (index, item) {
      var BolaTitulo = $(this).text();
      if (bola.toString() == BolaTitulo.toString()) {
        if (statusAtualBola == 'inativa') {
          if (tipoSorteio == 2) {
            $(this).addClass("circulo-preferido");
            $(this).removeClass("circulo");
          }
          else {
            $(this).addClass("circulo2-preferido");
            $(this).removeClass("circulo2");
          }
        }
        else {
          if (tipoSorteio == 2) {
            $(this).addClass("circulo");
            $(this).removeClass("circulo-preferido");
          }
          else {
            $(this).addClass("circulo2");
            $(this).removeClass("circulo2-preferido");
          }
        }
      }
    });
  }

  function atualizaBolasMarcadas(acao, bola) {
    // Adiciona e remove bolas do array em LocalStorage
    if (localStorage.getItem("AS_bolasMarcadas")) {
      var JSONbolasMarcadas = JSON.parse(localStorage.getItem("AS_bolasMarcadas"));
    }
    else {
      JSONbolasMarcadas = '';
    }
    var dataBolaMarcada = $("#AS_data_sorteio").val();

    var AS_sorteioSelecionado = "S" + $("#AS_sorteioSelecionado").val();
    if (JSONbolasMarcadas['S1']) { var S1 = JSONbolasMarcadas['S1']; }
    else { var S1 = ""; }
    if (JSONbolasMarcadas['S2']) { var S2 = JSONbolasMarcadas['S2']; }
    else { var S2 = ""; }
    if (JSONbolasMarcadas['S3']) { var S3 = JSONbolasMarcadas['S3']; }
    else { var S3 = ""; }
    if (JSONbolasMarcadas['S4']) { var S4 = JSONbolasMarcadas['S4']; }
    else { var S4 = ""; }
    if (JSONbolasMarcadas['S5']) { var S5 = JSONbolasMarcadas['S5']; }
    else { var S5 = ""; }
    if (JSONbolasMarcadas['S6']) { var S6 = JSONbolasMarcadas['S6']; }
    else { var S6 = ""; }

    if (JSONbolasMarcadas[AS_sorteioSelecionado]) {
      var bolasMarcadas = JSONbolasMarcadas[AS_sorteioSelecionado];
      var bolasMarcadasArray = JSONbolasMarcadas[AS_sorteioSelecionado].split(';');
    }
    else {
      var bolasMarcadas = '';
      var bolasMarcadasArray = [];
    }
    //console.log(acao);
    if (acao == 'add') {
      bolasMarcadas = bolasMarcadas + ';' + bola;
      if ($("#AS_sorteioSelecionado").val() == 1) { S1 = bolasMarcadas; }
      if ($("#AS_sorteioSelecionado").val() == 2) { S2 = bolasMarcadas; }
      if ($("#AS_sorteioSelecionado").val() == 3) { S3 = bolasMarcadas; }
      if ($("#AS_sorteioSelecionado").val() == 4) { S4 = bolasMarcadas; }
      if ($("#AS_sorteioSelecionado").val() == 5) { S5 = bolasMarcadas; }
      if ($("#AS_sorteioSelecionado").val() == 6) { S6 = bolasMarcadas; }
      var NOVA_AS_bolasMarcadas = '{"dataSorteio":"' + dataBolaMarcada + '","S1":"' + S1 + '","S2":"' + S2 + '","S3":"' + S3 + '","S4":"' + S4 + '","S5":"' + S5 + '","S6":"' + S6 + '"}';
      localStorage.setItem("AS_bolasMarcadas", NOVA_AS_bolasMarcadas);
    }
    else if (acao == 'rem') {
      bolasMarcadasArray.forEach(function (bolaSelecionada, i) {
        if (bolaSelecionada == bola) {
          bolasMarcadasArray.splice(i, 1);
        }
      });
      bolasMarcadas = bolasMarcadasArray.join(';');
      if ($("#AS_sorteioSelecionado").val() == 1) { S1 = bolasMarcadas; }
      if ($("#AS_sorteioSelecionado").val() == 2) { S2 = bolasMarcadas; }
      if ($("#AS_sorteioSelecionado").val() == 3) { S3 = bolasMarcadas; }
      if ($("#AS_sorteioSelecionado").val() == 4) { S4 = bolasMarcadas; }
      if ($("#AS_sorteioSelecionado").val() == 5) { S5 = bolasMarcadas; }
      if ($("#AS_sorteioSelecionado").val() == 6) { S6 = bolasMarcadas; }
      var NOVA_AS_bolasMarcadas = '{"dataSorteio":"' + dataBolaMarcada + '","S1":"' + S1 + '","S2":"' + S2 + '","S3":"' + S3 + '","S4":"' + S4 + '","S5":"' + S5 + '","S6":"' + S6 + '"}';
      //console.log(NOVA_AS_bolasMarcadas);
      localStorage.setItem("AS_bolasMarcadas", NOVA_AS_bolasMarcadas);
    }
  }

  function pesquisaStatusBola(bola) {
    var AS_sorteioSelecionado = "S" + $("#AS_sorteioSelecionado").val();
    if (localStorage.getItem("AS_bolasMarcadas")) {
      var JSONbolasMarcadas = JSON.parse(localStorage.getItem("AS_bolasMarcadas"));
      var retorno = 'inativa';
      $.each(JSONbolasMarcadas, function (index, value) {
        if (index == AS_sorteioSelecionado) {
          var bolasMarcadasArray = value.split(';');
          bolasMarcadasArray.forEach(function (bolaSelecionada, i) {
            if (bolaSelecionada == bola) {
              retorno = 'ativa';
            }
          });
        }
      });
    }
    else {
      retorno = 'inativa';
    }
    return retorno;
  }

});
