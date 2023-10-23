jQuery(function () {
  ktmp = Date.now();
  // verificar sobre limpar a marcação ao carregar sorteios anteriores
  // ao carregar já marcar, alterar a escrita dos 3 tipos
  // testar com titulos  dupplo e unica chance e validar a marcação

  // Define a largura das bolas para marcação
  defineLarguraDivNumSorteados();

  // Carrega Dados iniciais
  carregarDados();

  // Ao clicar no número do premio
  $('button[name="selSorteio"]').on('click', function () {
    var selID = this.id;
    $("#AS_sorteioSelecionado").val(this.value);
    $('button[name="selSorteio"]').each(function (index, item) {
      $(this).removeClass("button-active");
    });
    $("#" + selID).addClass("button-active");
    limparMarcacao();
    marcaBolasSorteiosJaInformados(this.value);
    //carregar nova marcação
  });

  // Nome em homenagem ao Patrick
  function marcaBolasSorteiosJaInformados(Sorteio) {
    var AS_sorteioSelecionado = "S" + Sorteio;
    var tipoSorteio = $("#AS_tipo_sorteio").val();

    if (localStorage.getItem("AS_bolasMarcadas")) {
      var JSONbolasMarcadas = JSON.parse(localStorage.getItem("AS_bolasMarcadas"));
      $.each(JSONbolasMarcadas, function (index, value) {
        if (index == AS_sorteioSelecionado) {
          var bolasMarcadasArray = value.split(';');
          bolasMarcadasArray.forEach(function (bolaSelecionada, i) {
            // bolas selecao
            $("#resultado_b" + bolaSelecionada).addClass("circulo-preferido");
            $("#resultado_b" + bolaSelecionada).removeClass("circulo-apagado");
            // bolas Titulo
            $("div[name='AS_bola_titulo']").each(function (index, item) {
              var BolaTitulo = $(this).text();
              if (bolaSelecionada.toString() == BolaTitulo.toString()) {
                if (tipoSorteio == 2) {
                  $(this).addClass("circulo-preferido");
                  $(this).removeClass("circulo");
                }
                else {
                  $(this).addClass("circulo2-preferido");
                  $(this).removeClass("circulo2");
                }
              }
            });
          });
        }
      });
    }
  }

  // Ao clicar em Limpar
  $('button[name="AS_limpar"]').on('click', function () {
    var Dialog_text = 'Deseja limpar as bolas marcadas para este sorteio ?';
    var Dialog_title = null;
    // Cria alerta
    app.dialog.create({
      title: Dialog_title,
      text: '<div style="font-size: 0.9em;">' + Dialog_text + '</div>',
      closeByBackdropClick: false, backdrop: true,
      buttons: [
        {
          text: 'NÃO',
          cssClass: 'dialog_button_esquerda dialog-button-50',
          onClick: function (a, b) {
            app.dialog.close();
          },
        },
        {
          text: 'SIM',
          cssClass: 'dialog_ok_Button dialog_button_direita dialog-button-50',
          onClick: function (a, b) {
            limparMarcacao('sorteio');
          },
        },
      ],
      on: { opened: function (a2, b2, c2) { } }
    }).open();
  });

  // Limpa marcação e títulos
  function limparMarcacao(limpar) {
    if (limpar == 'todos') {
      localStorage.removeItem("AS_bolasMarcadas");
    }
    else if (limpar == 'sorteio') {
      if (localStorage.getItem("AS_bolasMarcadas")) {
        var JSONbolasMarcadas = JSON.parse(localStorage.getItem("AS_bolasMarcadas"));
        var dataBolaMarcada = $("#AS_data_sorteio").val();
        var AS_sorteioSelecionado = "S" + $("#AS_sorteioSelecionado").val();
        //console.log(AS_sorteioSelecionado);
        if (AS_sorteioSelecionado == 'S1') { var S1 = ''; } else { var S1 = JSONbolasMarcadas['S1']; }
        if (AS_sorteioSelecionado == 'S2') { var S2 = ''; } else { var S2 = JSONbolasMarcadas['S2']; }
        if (AS_sorteioSelecionado == 'S3') { var S3 = ''; } else { var S3 = JSONbolasMarcadas['S3']; }
        if (AS_sorteioSelecionado == 'S4') { var S4 = ''; } else { var S4 = JSONbolasMarcadas['S4']; }
        if (AS_sorteioSelecionado == 'S5') { var S5 = ''; } else { var S5 = JSONbolasMarcadas['S5']; }
        if (AS_sorteioSelecionado == 'S6') { var S6 = ''; } else { var S6 = JSONbolasMarcadas['S6']; }

        var NOVA_AS_bolasMarcadas = '{"dataSorteio":"' + dataBolaMarcada + '","S1":"' + S1 + '","S2":"' + S2 + '","S3":"' + S3 + '","S4":"' + S4 + '","S5":"' + S5 + '","S6":"' + S6 + '"}';
        //console.log(NOVA_AS_bolasMarcadas);
        localStorage.setItem("AS_bolasMarcadas", NOVA_AS_bolasMarcadas);
      }
    }
    $("div[name='bolas_resultado']").each(function (index, item) {
      $(this).addClass("circulo-apagado");
      $(this).removeClass("circulo-preferido");
    });
    $("div[name='AS_bola_titulo']").each(function (index, item) {
      var tipoSorteio = $("#AS_tipo_sorteio").val();
      if (tipoSorteio == 2) {
        $(this).addClass("circulo");
        $(this).removeClass("circulo-preferido");
      }
      else {
        $(this).addClass("circulo2");
        $(this).removeClass("circulo2-preferido");
      }
    });

  }

  // Define a largura das bolas para marcação
  function defineLarguraDivNumSorteados() {
    var appWidth = $("#app").width();
    var widtNumSor = appWidth - 20; // 20 é padding dos cards
    var qtdItens = widtNumSor / 32; // 32pixels = 30px da bola e 2 px de margem
    qtdItens = Math.trunc(qtdItens) - 1; // Trunca e pega valor -1
    widtNumSor = qtdItens * 30; // qtdItens * 30pixels 
    widtNumSor = widtNumSor + (qtdItens * 2 * 2) + 2; //Qtd itens * 2px de margem * 2 margens (esq e dir)
    $("#numerosSorteados").width(widtNumSor);
  }

  // Carrega Dados / AJAX
  function carregarDados(dataPesquisa) {

    app.dialog.preloader('Pesquisando');
    var dataC = {
      user_login: localStorage.getItem("user_login")
    };
    var dataD = {
      ktmp: ktmp,
      device: localStorage.getItem("device"),
    };
    var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
    var dataD = JSON.stringify(dataD);


    app.request({
      url: servidor + '/api_public/sorteios/acompanharsorteio.php',
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("jwt"));
        request.setRequestHeader("chaveapp", chaveAPP);
        request.setRequestHeader("versaoapp", versaoAPP);
      },
      //async: false,
      method: 'POST',
      dataType: 'json',
      data: {
        a: JSON.stringify(criptoDadosEnviado(ktmp, ktmp)),
        c: dataC,
        d: dataD
      },
      success: function (resposta) {
        app.dialog.close();
        app.preloader.hide();
        var resp = descriptDadosRecebido(resposta, ktmp);
        var respMerge = { ...resp.d, ...resp.c, ...resp.a };
        if (respMerge.status == "ok") {
          if (respMerge.historicoCompras.qtd > 0) {
            if (respMerge.qtdPremios == '3') {
              $("#segmento_3_Sorteios").show();
              $("#segmento_4_Sorteios").hide();
              $("#segmento_5_Sorteios").hide();
            }
            else if (respMerge.qtdPremios == '4') {
              $("#segmento_3_Sorteios").hide();
              $("#segmento_4_Sorteios").show();
              $("#segmento_5_Sorteios").hide();
            }
            else {
              $("#segmento_3_Sorteios").hide();
              $("#segmento_4_Sorteios").hide();
              $("#segmento_5_Sorteios").show();
            }
          } else {
            //console.log('aqui');
            $("#AS_conferirSorteio").hide();
            $("#AS_Card").hide();
            $("#AS_cardObservacoes").show();
          }

          $('#AS_tipo_sorteio').val(respMerge.dadosSorteio.tipo_sorteio);
          var arrayDataSorteio = respMerge.dadosSorteio.data_sorteio.split(' ');
          var hora = arrayDataSorteio[1].split(':')[0];
          var min = arrayDataSorteio[1].split(':')[1];
          var data_sorteio = arrayDataSorteio[0].split('-').reverse().join('/').toString();
          $('#AS_data_sorteio').val(data_sorteio);
          var data_sorteioCAB = data_sorteio + " às " + hora + ":" + min;
          $('#AS_DataSorteio_Cab').text(data_sorteioCAB);

          if (localStorage.getItem("AS_bolasMarcadas")) {
            var testeJson = verificaJSON(localStorage.getItem("AS_bolasMarcadas"));
            if (!testeJson) { limparMarcacao('todos'); }
            else {
              var JSONbolasMarcadas = JSON.parse(localStorage.getItem("AS_bolasMarcadas"));
              if (data_sorteio != JSONbolasMarcadas.dataSorteio) {
                limparMarcacao('todos');
              }
            }
          }
          escreveTitulos(respMerge.historicoCompras.compras, respMerge.dadosSorteio);
        }
        else {
          ErroAjax(respMerge);
        }
      },
      error: function (erro) {
        ErroAjax('error', 'conexao/servidor');
        //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_XX)');
      },
      complete: function () { }
    });

  }

  // Escreve titulos
  function escreveTitulos(arrayTitulos, dadosSorteio) {

    var dataSorteio = dadosSorteio.data_sorteio;
    var qtd_num_sorte = dadosSorteio.qtd_num_sorte;
    var giro_extra = dadosSorteio.giro_extra;
    $.each(arrayTitulos, function (index, titulo) {
      var idTitulo = 0;
      code = "";
      var dataTitulo = titulo.data.split('-').reverse().join('/').toString();
      if (titulo.tipo_sorteio == 1) {
        code = AS_escreverHistoricoTitulo1(titulo, idTitulo, dataSorteio, qtd_num_sorte, giro_extra);
      }
      else if (titulo.tipo_sorteio == 2) {
        code = AS_escreverHistoricoTitulo2(titulo, idTitulo, dataSorteio, qtd_num_sorte, giro_extra);
      }
      else if (titulo.tipo_sorteio == 3) {
        code = AS_escreverHistoricoTitulo3(titulo, idTitulo, dataSorteio, qtd_num_sorte, giro_extra);
      }

      idTitulo = idTitulo + 1;
      $('.titulos').append(code);
    });

  }

  // Escreve titulos Simples Chance
  function AS_escreverHistoricoTitulo1(titulo, id, data_sorteio, qtd_num_sorte, giro_extra) {
    // Verifica se o título está no carrinho
    var classeCard = "";
    var classeHeader = "";

    var arrayDataSorteio = data_sorteio.split(' ');
    var hora = arrayDataSorteio[1].split(':')[0];
    var min = arrayDataSorteio[1].split(':')[1];
    var data_sorteioRodape = arrayDataSorteio[0].split('-').reverse().join('/').toString();
    data_sorteioRodape = data_sorteioRodape + " " + hora + ":" + min;

    var arrayDataCompra = titulo.criado_em.split(' ');
    var hora = arrayDataCompra[1].split(':')[0];
    var min = arrayDataCompra[1].split(':')[1];
    var data_compraRodape = arrayDataCompra[0].split('-').reverse().join('/').toString();
    data_compraRodape = data_compraRodape + " " + hora + ":" + min;

    var numTituloID = parseInt(titulo.titulo1);
    var numTituloID_str = numTituloID.toLocaleString('pt-br', { minimumFractionDigits: 0 });

    var numSorteID1 = numTituloID;
    var numSorteID1_str = numTituloID_str;

    var vendasID = titulo.guid_vendas;
    var vendasItensID = titulo.guid_vendas_itens;

    if (isNaN(parseInt(titulo.titulo_rodada))) {
      var numTituloExtra = "";
      var numTituloExtra_str = "";
    } else {
      var numTituloExtra = parseInt(titulo.titulo_rodada);
      var numTituloExtra_str = numTituloExtra.toLocaleString('pt-br', { minimumFractionDigits: 0 });
    }

    // Verifica a qtd de numeros da sorte
    if (isNaN(parseInt(qtd_num_sorte))) { qtd_num_sorte = parseInt(titulo.tipo_sorteio); }
    else if (parseInt(qtd_num_sorte) > parseInt(titulo.tipo_sorteio)) { qtd_num_sorte = parseInt(titulo.tipo_sorteio); }
    var qtd_titulos_direta = parseInt(qtd_num_sorte) + parseInt(giro_extra);

    var cpf = localStorage.getItem("cpf");
    cpf = cpf.replace(" ", "");
    cpf = cpf.replace("-", "");
    cpf = cpf.replace(".", "");

    var bolasStr = titulo.combinacao1;
    var numBolas = bolasStr.split("-");

    var numsTitulos = numSorteID1; // Titulo único / simples chance
    var code = "";

    var code = "";
    code += "           <!-- MODELO 1 TITULO-->";
    code += "          <div id='AS-card-" + id + "' class='card card-titulo " + classeCard + "' numsTitulos='" + numsTitulos + "' tipoTitulo='1'";
    code += "            vendasID='" + vendasID + "' vendasItensID='" + vendasItensID + "'>";
    code += "            <!-- CAB-TITULO -->";
    code += "            <div id='AS-header-" + id + "' class='card-header cartela-card-header-vertical " + classeHeader + "'>";
    code += "              <div class='row' style='margin-left: 2px;margin-right: 2px; width: 100%;'>";
    code += "                <div class='col-45' style='float: left;'>";
    code += "                  <p class='label'";
    code += "                    style='margin-top: 0px;margin-bottom: 0px;float: left;font-size: 0.8rem;text-align: center;'>";
    code += "                    <span style='font-size: 0.7rem;'>" + nomeProduto + "<\/span>";
    code += "                    <span class='span-numTitulo' style='display: block;'>" + numTituloID_str + "<\/span>";
    code += "                  <\/p>";
    code += "                <\/div>";
    code += "                <div class='col-55' style='float: right;'>";

    if (qtd_titulos_direta == 1) {
      if ((parseInt(giro_extra) == 1) && (numTituloExtra_str != "")) {
        //  1 Titulo e 1 Rodada Extra
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>" + textoDadoAppJS.dadosComum.premioExtra + " : <\/span>";
        code += "                    <span class='span-numSorte' style='display: block;'>" + numTituloExtra_str + "<\/span>";
        code += "                  <\/p>";
      }
      else if (parseInt(qtd_num_sorte) == 1) {
        // 1 Titulo e 1 Numero da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte: <\/span>";
        code += "                    <span class='span-numSorte' style='display: block;'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p>";
      }
    }
    else {
      if (parseInt(qtd_num_sorte) == 1) {
        // 1 Titulo e 2 Numerow da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p>";
      }
      if ((parseInt(giro_extra) == 1) && (numTituloExtra_str != "")) {
        //  1 Titulo e 1 Rodada Extra
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>" + textoDadoAppJS.dadosComum.premioExtra + " : <\/span>";
        code += "                    <span class='span-numSorte'>" + numTituloExtra_str + "<\/span>";
        code += "                  <\/p>";
      }
    }

    code += "                <\/div>";
    code += "              <\/div>";
    code += "            <\/div><!-- FIM CAB-TITULO -->";

    code += "            <div class='block block-titulo'>";
    code += "              <div class='row row-titulo'>";
    code += "                <div class='col col2-titulo'>";

    var code2 = "";
    var count = 1;

    $.each(numBolas, function (index, value) {
      if (value != "00") {
        if (count == 1) { code2 += "<div class='row row2'>"; }

        var classeADD = "circulo2";
        if (verificaBolaMarcada(value) == true) {
          var classeADD = "circulo2-preferido";
        }

        code2 += "<div id='AScard-" + id + "_t-1_b-" + value + "' name='AS_bola_titulo' class='" + classeADD + "'>" + value + "<\/div>";
        count = count + 1;
        if (count == 6) {
          count = 1;
          code2 += "<\/div>";
        }
      }
    });

    code += code2;
    code += "                <\/div>";
    code += "              <\/div>";
    code += "            <\/div>";
    code += "<div class='card-footer card-footer-titulo' style='justify-content: center;padding-top: 0px !important;'>";
    code += "<div class='row'  style='width: 100%;height: 100%;'>";
    code += "<div class='rodape-esq'>Data Sorteio<br>" + data_sorteioRodape + "</div>";
    code += "<div class='rodape-dir'>Data Compra<br>" + data_compraRodape + "</div>";
    code += " <\/div><\/div><\/div><!-- FIM MODELO 1 TITULO-->";
    return code;
  }

  // Escreve titulos Dupla Chance
  function AS_escreverHistoricoTitulo2(titulo, id, data_sorteio, qtd_num_sorte, giro_extra) {
    // Verifica se o título está no carrinho

    var classeCard = "";
    var classeHeader = "";

    var arrayDataSorteio = data_sorteio.split(' ');
    var hora = arrayDataSorteio[1].split(':')[0];
    var min = arrayDataSorteio[1].split(':')[1];
    var data_sorteioRodape = arrayDataSorteio[0].split('-').reverse().join('/').toString();
    data_sorteioRodape = data_sorteioRodape + " " + hora + ":" + min;

    var arrayDataCompra = titulo.criado_em.split(' ');
    var hora = arrayDataCompra[1].split(':')[0];
    var min = arrayDataCompra[1].split(':')[1];
    var data_compraRodape = arrayDataCompra[0].split('-').reverse().join('/').toString();
    data_compraRodape = data_compraRodape + " " + hora + ":" + min;

    var numTituloID = parseInt(titulo.titulo1);
    var numTituloID_str = numTituloID.toLocaleString('pt-br', { minimumFractionDigits: 0 });

    var numSorteID1 = numTituloID;
    var numSorteID1_str = numTituloID_str;

    var numSorteID2 = parseInt(titulo.titulo2);
    var numSorteID2_str = numSorteID2.toLocaleString('pt-br', { minimumFractionDigits: 0 });

    // Verifica o titulo da rodada Extra 
    if (isNaN(parseInt(titulo.titulo_rodada))) {
      var numTituloExtra = "";
      var numTituloExtra_str = "";
    } else {
      var numTituloExtra = parseInt(titulo.titulo_rodada);
      var numTituloExtra_str = numTituloExtra.toLocaleString('pt-br', { minimumFractionDigits: 0 });
    }

    // Verifica a qtd de numeros da sorte
    if (isNaN(parseInt(qtd_num_sorte))) { qtd_num_sorte = parseInt(titulo.tipo_sorteio); }
    else if (parseInt(qtd_num_sorte) > parseInt(titulo.tipo_sorteio)) { qtd_num_sorte = parseInt(titulo.tipo_sorteio); }
    var qtd_titulos_direta = parseInt(qtd_num_sorte) + parseInt(giro_extra);

    var vendasID = titulo.guid_vendas;
    var vendasItensID = titulo.guid_vendas_itens;

    var cpf = localStorage.getItem("cpf");
    cpf = cpf.replace(" ", "");
    cpf = cpf.replace("-", "");
    cpf = cpf.replace(".", "");

    var bolasStr = titulo.combinacao1;
    var numBolas = bolasStr.split("-");

    var bolasStr2 = titulo.combinacao2;
    var numBolas2 = bolasStr2.split("-");

    var numsTitulos = numSorteID1 + ";" + numSorteID2; // Titulo único / simples chance
    var code = "";

    code += "          <!-- MODELO 2 TITULOS -->";
    code += "          <div id='AS-card-" + id + "' class='card card-titulo " + classeCard + "' numsTitulos='" + numsTitulos + "' tipoTitulo='2'";
    code += "            vendasID='" + vendasID + "' vendasItensID='" + vendasItensID + "'>";
    code += "            <!-- CAB-TITULO -->";
    code += "            <div id='AS-header-" + id + "' class='card-header cartela-card-header-vertical " + classeHeader + "'>";
    code += "                <div class='col-45' style='float: left;width: 60%;'>";
    code += "                  <p class='label'";
    code += "                    style='margin-top: 0px;margin-bottom: 0px;float: left;font-size: 0.8rem;text-align: center;'>";
    code += "                    <span style='font-size: 0.7rem;'>" + nomeProduto + "<\/span>";
    code += "                    <span class='span-numTitulo' style='display: block;'>" + numTituloID_str + "<\/span>";
    code += "                  <\/p>";
    code += "                <\/div>";
    code += "                <div class='col-55' style='float: right;'>";

    if (qtd_titulos_direta == 1) {
      if ((parseInt(giro_extra) == 1) && (numTituloExtra_str != "")) {
        //  1 Titulo e 1 Rodada Extra
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>" + textoDadoAppJS.dadosComum.premioExtra + " : <\/span>";
        code += "                    <span class='span-numSorte' style='display: block;'>" + numTituloExtra_str + "<\/span>";
        code += "                  <\/p>";
      }
      else if (parseInt(qtd_num_sorte) == 1) {
        // 1 Titulo e 1 Numero da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte: <\/span>";
        code += "                    <span class='span-numSorte' style='display: block;'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p>";
      }
    }
    else {
      if (parseInt(qtd_num_sorte) == 1) {
        // 1 Titulo e 2 Numerow da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p>";
      }
      else if (parseInt(qtd_num_sorte) == 2) {
        // 1 Titulo e 2 Numerow da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 1: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p>";
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 2: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID2_str + "<\/span>";
        code += "                  <\/p>";
      }
      if ((parseInt(giro_extra) == 1) && (numTituloExtra_str != "")) {
        //  1 Titulo e 1 Rodada Extra
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>" + textoDadoAppJS.dadosComum.premioExtra + " : <\/span>";
        code += "                    <span class='span-numSorte'>" + numTituloExtra_str + "<\/span>";
        code += "                  <\/p>";
      }
    }

    code += "                <\/div>";
    //code += "              <\/div>";
    code += "            <\/div><!-- FIM CAB-TITULO -->";

    code += "            <div class='block block-titulo'>";
    code += "              <div class='row row-titulo'>";
    code += "                <div class='col col-titulo'>";

    var code2 = "";
    var count = 1;

    $.each(numBolas, function (index, value) {
      if (value != "00") {
        if (count == 1) { code2 += "<div class='row row-titulo2'>"; }

        var classeADD = "circulo";
        if (verificaBolaMarcada(value) == true) {
          var classeADD = "circulo-preferido";
        }

        code2 += "<div id='AScard-" + id + "_t-1_b-" + value + "'  name='AS_bola_titulo' class='" + classeADD + "'>" + value + "<\/div>";

        count = count + 1;
        if (count == 6) {
          count = 1;
          code2 += "<\/div>";
        }
      }
    });
    code += code2;

    code += "<\/div>";
    code += "<div class='col col-titulo'>";

    code2 = "";
    count = 1;

    $.each(numBolas2, function (index, value) {
      if (value != "00") {
        if (count == 1) { code2 += "<div class='row row-titulo2'>"; }

        var classeADD = "circulo";
        if (verificaBolaMarcada(value) == true) {
          var classeADD = "circulo-preferido";
        }

        code2 += "<div id='AScard-" + id + "_t-2_b-" + value + "' name='AS_bola_titulo' class='" + classeADD + "'>" + value + "<\/div>";

        count = count + 1;
        if (count == 6) {
          count = 1;
          code2 += "<\/div>";
        }
      }
    });
    code += code2;
    code += "                <\/div>";
    code += "              <\/div>";
    code += "            <\/div>";

    code += "<div class='card-footer card-footer-titulo' style='justify-content: center;padding-top: 0px !important;'>";
    code += "<div class='row'  style='width: 100%;height: 100%;'>";
    code += "<div class='rodape-esq'>Data Sorteio<br>" + data_sorteioRodape + "</div>";
    code += "<div class='rodape-dir'>Data Compra<br>" + data_compraRodape + "</div>";
    code += " <\/div><\/div><\/div><!-- FIM MODELO 2 TITULO-->";
    return code;
  }

  // Escreve titulos Tripla Chance
  function AS_escreverHistoricoTitulo3(titulo, id, data_sorteio, qtd_num_sorte, giro_extra) {
    // Verifica se o título está no carrinho

    var classeCard = "";
    var classeHeader = "";

    var arrayDataSorteio = data_sorteio.split(' ');
    var hora = arrayDataSorteio[1].split(':')[0];
    var min = arrayDataSorteio[1].split(':')[1];
    var data_sorteioRodape = arrayDataSorteio[0].split('-').reverse().join('/').toString();
    data_sorteioRodape = data_sorteioRodape + " " + hora + ":" + min;

    var arrayDataCompra = titulo.criado_em.split(' ');
    var hora = arrayDataCompra[1].split(':')[0];
    var min = arrayDataCompra[1].split(':')[1];
    var data_compraRodape = arrayDataCompra[0].split('-').reverse().join('/').toString();
    data_compraRodape = data_compraRodape + " " + hora + ":" + min;

    var numTituloID = parseInt(titulo.titulo1);
    var numTituloID_str = numTituloID.toLocaleString('pt-br', { minimumFractionDigits: 0 });

    var numSorteID1 = numTituloID;
    var numSorteID1_str = numTituloID_str;

    var numSorteID2 = parseInt(titulo.titulo2);
    var numSorteID2_str = numSorteID2.toLocaleString('pt-br', { minimumFractionDigits: 0 });

    var numSorteID3 = parseInt(titulo.titulo3);
    var numSorteID3_str = numSorteID3.toLocaleString('pt-br', { minimumFractionDigits: 0 });

    var vendasID = titulo.guid_vendas;
    var vendasItensID = titulo.guid_vendas_itens;

    // Verifica o titulo da rodada Extra 
    if (isNaN(parseInt(titulo.titulo_rodada))) {
      var numTituloExtra = "";
      var numTituloExtra_str = "";
    } else {
      var numTituloExtra = parseInt(titulo.titulo_rodada);
      var numTituloExtra_str = numTituloExtra.toLocaleString('pt-br', { minimumFractionDigits: 0 });
    }

    // Verifica a qtd de numeros da sorte
    if (isNaN(parseInt(qtd_num_sorte))) { qtd_num_sorte = parseInt(titulo.tipo_sorteio); }
    else if (parseInt(qtd_num_sorte) > parseInt(titulo.tipo_sorteio)) { qtd_num_sorte = parseInt(titulo.tipo_sorteio); }
    var qtd_titulos_direta = parseInt(qtd_num_sorte) + parseInt(giro_extra);

    var cpf = localStorage.getItem("cpf");
    cpf = cpf.replace(" ", "");
    cpf = cpf.replace("-", "");
    cpf = cpf.replace(".", "");

    var bolasStr = titulo.combinacao1;
    var numBolas = bolasStr.split("-");

    var bolasStr2 = titulo.combinacao2;
    var numBolas2 = bolasStr2.split("-");

    var bolasStr3 = titulo.combinacao3;
    var numBolas3 = bolasStr3.split("-");

    var numsTitulos = numSorteID1 + ";" + numSorteID2 + ";" + numSorteID3; // Titulo único / simples chance
    var code = "";

    code += "          <!-- MODELO 3 TITULOS -->";
    code += "          <div id='AS-card-" + id + "' class='card card-titulo  " + classeCard + "' numsTitulos='" + numsTitulos + "' tipoTitulo='3'";
    code += "            vendasID='" + vendasID + "' vendasItensID='" + vendasItensID + "'>";
    code += "            <!-- CAB-TITULO -->";
    code += "            <div id='AS-header-" + id + "' class='card-header cartela-card-header-vertical " + classeHeader + "'>";
    code += "                <div class='col-45' style='float: left;width: 60%;'>";
    code += "                  <p class='label'";
    code += "                    style='margin-top: 0px;margin-bottom: 0px;float: left;font-size: 0.8rem;text-align: center;'>";
    code += "                    <span style='font-size: 0.7rem;'>" + nomeProduto + "<\/span>";
    code += "                    <span class='span-numTitulo' style='display: block;'>" + numTituloID_str + "<\/span>";
    code += "                  <\/p>";
    code += "                <\/div>";
    code += "                <div class='col-55' style='float: right;'>";

    if (qtd_titulos_direta == 1) {
      if ((parseInt(giro_extra) == 1) && (numTituloExtra_str != "")) {
        //  1 Titulo e 1 Rodada Extra
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>" + textoDadoAppJS.dadosComum.premioExtra + " : <\/span>";
        code += "                    <span class='span-numSorte' style='display: block;'>" + numTituloExtra_str + "<\/span>";
        code += "                  <\/p>";
      }
      else if (parseInt(qtd_num_sorte) == 1) {
        // 1 Titulo e 1 Numero da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte: <\/span>";
        code += "                    <span class='span-numSorte' style='display: block;'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p>";
      }
    }
    else {
      if (parseInt(qtd_num_sorte) == 1) {
        // 1 Titulo e 2 Numerow da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p>";
      }
      else if (parseInt(qtd_num_sorte) == 2) {
        // 1 Titulo e 2 Numerow da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 1: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p>";
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 2: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID2_str + "<\/span>";
        code += "                  <\/p>";
      }
      else if (parseInt(qtd_num_sorte) == 3) {
        // 1 Titulo e 2 Numerow da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 1: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p></br>";
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 2: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID2_str + "<\/span>";
        code += "                  <\/p></br>";
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 3: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID3_str + "<\/span>";
        code += "                  <\/p></br>";
      }
      if ((parseInt(giro_extra) == 1) && (numTituloExtra_str != "")) {
        //  1 Titulo e 1 Rodada Extra
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>" + textoDadoAppJS.dadosComum.premioExtra + " : <\/span>";
        code += "                    <span class='span-numSorte'>" + numTituloExtra_str + "<\/span>";
        code += "                  <\/p>";
      }
    }

    code += "                <\/div>";
    code += "            <\/div><!-- FIM CAB-TITULO -->";

    code += "            <div class='block block-titulo'>";
    // Escreve titulo 1
    code += "              <div class='row row-titulo'>";
    code += "                <div class='col col2-titulo'>";
    var code2 = "";
    var count = 1;
    $.each(numBolas, function (index, value) {
      if (value != "00") {
        if (count == 1) { code2 += "<div class='row row2'>"; }

        var classeADD = "circulo2";
        if (verificaBolaMarcada(value) == true) {
          var classeADD = "circulo2-preferido";
        }

        code2 += "<div id='AScard-" + id + "_t-1_b-" + value + "'  name='AS_bola_titulo' class='" + classeADD + "'>" + value + "<\/div>";

        count = count + 1;
        if (count == 6) {
          count = 1;
          code2 += "<\/div><!--fim -->";
        }
      }
    });
    code += code2;
    code += "<\/div>";
    code += "<\/div>";
    // Escreve titulo 2
    code += "<div class='row row-titulo'>";
    code += "<div class='col col2-titulo'>";
    var code2 = "";
    var count = 1;
    $.each(numBolas2, function (index, value) {
      if (value != "00") {
        if (count == 1) { code2 += "<div class='row row2'>"; }

        var classeADD = "circulo2";
        if (verificaBolaMarcada(value) == true) {
          var classeADD = "circulo2-preferido";
        }

        code2 += "<div id='AScard-" + id + "_t-2_b-" + value + "'  name='AS_bola_titulo' class='" + classeADD + "'>" + value + "<\/div>";

        count = count + 1;
        if (count == 6) {
          count = 1;
          code2 += "<\/div><!--fim -->";
        }
      }
    });
    code += code2;
    code += "<\/div>";
    code += "<\/div>";
    // Escreve titulo 3
    code += "<div class='row row-titulo'>";
    code += "<div class='col col2-titulo'>";
    var code2 = "";
    var count = 1;
    $.each(numBolas3, function (index, value) {
      if (value != "00") {
        if (count == 1) { code2 += "<div class='row row2'>"; }

        var classeADD = "circulo2";
        if (verificaBolaMarcada(value) == true) {
          var classeADD = "circulo2-preferido";
        }

        code2 += "<div id='AScard-" + id + "_t-3_b-" + value + "'  name='AS_bola_titulo' class='" + classeADD + "'>" + value + "<\/div>";

        count = count + 1;
        if (count == 6) {
          count = 1;
          code2 += "<\/div><!--fim -->";
        }
      }
    });

    code += code2;
    code += "                <\/div>";
    code += "              <\/div>";
    code += "            <\/div>";
    code += "<div class='card-footer card-footer-titulo' style='justify-content: center;padding-top: 0px !important;'>";
    code += "<div class='row'  style='width: 100%;height: 100%;'>";
    code += "<div class='rodape-esq'>Data Sorteio<br>" + data_sorteioRodape + "</div>";
    code += "<div class='rodape-dir'>Data Compra<br>" + data_compraRodape + "</div>";
    code += " <\/div><\/div><\/div><!-- FIM MODELO 3 TITULO-->";
    return code;
  }

  // Verifica se a bola em questão está marcada
  function verificaBolaMarcada(bola) {
    var AS_sorteioSelecionado = "S" + $("#AS_sorteioSelecionado").val();
    if (localStorage.getItem("AS_bolasMarcadas")) {
      var JSONbolasMarcadas = JSON.parse(localStorage.getItem("AS_bolasMarcadas"));
      var retorno = false;
      $.each(JSONbolasMarcadas, function (index, value) {
        if (index == AS_sorteioSelecionado) {
          var bolasMarcadasArray = value.split(';');
          bolasMarcadasArray.forEach(function (bolaSelecionada, i) {
            if (bolaSelecionada == bola) {
              retorno = true;
            }
          });
        }
      });
    }
    return retorno;
  }

});