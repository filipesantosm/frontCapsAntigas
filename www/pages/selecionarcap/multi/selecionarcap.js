jQuery(function () {
  // Carrega os títulos disponibilzados para venda
  var opSorteio = app.views.main.router.currentRoute.params.sorteio;

  lista_prateleira("nao", opSorteio);

  var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
  var numeros_preferidos = dadosUsuario.numeros_sorte;

  localStorage.setItem("numeros_preferidos", numeros_preferidos);
  // Executa a funcao Numero da Preferido ao carregar a pagina
  carregarNumPreferido(localStorage.getItem("numeros_preferidos"));

  // Direciona para o carrinho
  $("#FABcarrinho").on("click", function () {
    var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
    if (dadosUsuario.cep_ativo == "S") {
      var todosSorteios = JSON.parse(localStorage.getItem("todosSorteios"));

      var qtdTitulos = todosSorteios.totalSorteiosAbertos;
      var tipoTitulos = "carrinhoBanco";

      carregaDadosAtualizados_e_Direciona(qtdTitulos, tipoTitulos);
    }
    else {
      ErroValidacao('Desculpe, produto ainda não disponível em sua região !', aguardar = 'S', link = '/home/');
      return false;
    }
  });

  const carregaDadosAtualizados_e_Direciona = async (qtdTitulos, tipoTitulos) => {
    // funcão para aguardar carregar antes de direcionar
    const result = await getDadosAtualizados(localStorage.getItem('user_login'), 'S');
    app.views.main.router.navigate('/carrinho/' + qtdTitulos + '/' + tipoTitulos, {
      reloadCurrent: true, history: false, clearPreviousHistory: true,
      ignoreCache: true,
    });
  }

  // ********** INICIO NUMEROS PREFERIDOS / FAVORITOS ********** 
  // Cria o TOAST com icone para informar o usuario que deve clicar nos círculos para adicionar os numeros
  var toastIcon = app.toast.create({
    icon: '<i style="font-size: 3rem" class="mdi mdi-alert-circle-outline"></i>',
    text: 'Clique nos círculos para adicionar !',
    position: 'center',
    closeTimeout: 4000,
  });

  // Mostrar DIV Números PREFERIDOS / Favoritos
  $("#btn-atualizar-titulos-preferidos").on("click", function () {
    //console.log('atualiza prateleira com preferidos');
    // Remove os itens listados anteriormente e adiciona os novos com os numeros preferenciais
    $('.titulos').empty();
    lista_prateleira('sim', opSorteio);
    $("#div-atualizar-titulos-preferidos").hide();
  });


  $("#addPreferido").on("change", function () {
    var useNumPreferido = $("#addPreferido").is(":checked");
    if (useNumPreferido) {
      var numeros = localStorage.getItem("numeros_preferidos");
      if (!numeros) {
        toastIcon.open();
      }
      $("#block-numPreferido").show(500);
      // Remove os itens listados anteriormente e adiciona os novos com os numeros preferenciais
      $('.titulos').empty();
      lista_prateleira('sim', opSorteio);

    } else {
      $("#block-numPreferido").hide(500);
    }
  });

  // Alerar Números Preferidos
  $(".NumPreferido").on("click", function () {
    var item = this.id.slice(-1);
    // Adiciona o ID do numero Preferidos ao item oculto
    $("#NumItem").val(item);
    var valorAtual = parseInt($("#text-NumPreferido" + item).text());
    if ((!valorAtual) || (valorAtual == undefined) || (valorAtual == "") || (valorAtual == "null") || (valorAtual == "NaN")) {
      range.setValue(30);
    }
    else {
      range.setValue(valorAtual);
    }
    app.popup.open('.popup-addNumPreferido', true);
  });

  // Seleciona o Range de NumPreferido
  var range = app.range.get('.range-slider');

  // salvar numeros Preferidos / Favoritos
  $("#bt-SalvarNumPreferido").on("click", function () {
    var ArrayNumPreferido = [];
    ArrayNumPreferido[0] = parseInt($("#text-NumPreferido1").text());
    ArrayNumPreferido[1] = parseInt($("#text-NumPreferido2").text());
    ArrayNumPreferido[2] = parseInt($("#text-NumPreferido3").text());
    ArrayNumPreferido[3] = parseInt($("#text-NumPreferido4").text());

    var item = $("#NumItem").val();
    var novoValor = parseInt(range.getValue());

    if (novoValor == 0) { novoValor = "" };
    ArrayNumPreferido[item - 1] = novoValor;
    // organiza o Array, retirando campos em branco
    var ArrayNumPreferido = ArrayNumPreferido.filter(function (el) { return el; });
    ArrayNumPreferido = ArrayNumPreferido.sort(ordenarNumPreferido);
    ArrayNumPreferido = eliminaNumPreferidoDuplicado(ArrayNumPreferido);

    localStorage.setItem("numeros_preferidos", ArrayNumPreferido.join(";"))
    carregarNumPreferido(localStorage.getItem("numeros_preferidos"));
    salvarServidorNumPreferido(localStorage.getItem("numeros_preferidos"));
    app.popup.close('.popup-addNumPreferido', true);

    if (localStorage.getItem("numeros_preferidosPrateleira") != localStorage.getItem("numeros_preferidos")) {
      $("#div-atualizar-titulos-preferidos").show();
    }
    else {
      $("#div-atualizar-titulos-preferidos").hide();
    }

  });

  function atualizaCarrinhoCSS(acao, cardID, dadosCarrinho = null) {
    if (acao == 'add') {
      $("#bt-add-" + cardID).hide();
      $("#bt-rm-" + cardID).show();
      $("#card-" + cardID).addClass("cartela-card-add");
      $("#header-" + cardID).addClass("cartela-card-header-add");

    } else if (acao == 'rm') {
      $("#bt-rm-" + cardID).hide();
      $("#bt-add-" + cardID).show();
      $("#card-" + cardID).removeClass("cartela-card-add");
      $("#header-" + cardID).removeClass("cartela-card-header-add");
    }
    atualizaQtdItensCarrinhoMulti(acao, dadosCarrinho);
  }

  function atualizaQtdItensCarrinhoMulti(acao = null, dadosCarrinho = null) {
    var qtdItens = parseInt($('.cartela-card-add').length);
    var itens = [];
    var contador = 0;
    $(".cartela-card-add").each(function () {
      itens[contador] = $(this).attr('numstitulos');
      contador = contador + 1;
    });
    if (qtdItens > 0) {
      $("#texto-fab").text('CONCLUIR COMPRA ( ' + qtdItens + ' )');
      $("#FABcarrinho").show();
    }
    else {
      $("#texto-fab").text('CONCLUIR COMPRA');
      $("#FABcarrinho").hide();
    }

    if (localStorage.getItem("carrinhoMulti")) {
      var carrinho = JSON.parse(localStorage.getItem("carrinhoMulti"));
      if (!carrinho[opSorteio]) { carrinho[opSorteio] = {}; }
    }
    else {
      var carrinho = {};
      carrinho[opSorteio] = {};
    }

    if ((acao) && (dadosCarrinho)) {
      carrinho[opSorteio] = dadosCarrinho;
    }
    else {
      carrinho[opSorteio]['qtd'] = qtdItens;
    }
    // adiciona valor unitario
    carrinho[opSorteio]['itens'] = itens;
    //localStorage.setItem("carrinhoMulti", JSON.stringify(carrinho));
    atualizaCarrinhoMulti(carrinho);
  }

  function atualizaCarrinho(estoqueID, acao, cardID, opSorteio) {
    var ktmp = Date.now();

    var dataC = {
      user_login: localStorage.getItem("user_login"),
      estoqueID: estoqueID,
      acao: acao,
      ops: opSorteio
    };
    var dataD = {
      ktmp: ktmp,
      device: localStorage.getItem("device"),
    };
    var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
    var dataD = JSON.stringify(dataD);

    var jwt = localStorage.getItem("jwt");
    app.request({
      url: servidor + '/api_public/titulos/add_rm_carrinhoMulti.php',
      beforeSend: function (request) {
        request.setRequestHeader('Authorization', 'Bearer ' + jwt);
        request.setRequestHeader("chaveapp", chaveAPP);
        request.setRequestHeader("versaoapp", versaoAPP);
      },
      //async: false,
      method: 'POST',
      dataType: 'json',
      crossDomain: true,
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
        //console.log(respMerge);
        if (respMerge.status == "ok") {
          if (respMerge.dadosCarrinho) {
            //localStorage.setItem("dadosCarrinho", JSON.stringify(respMerge.dadosCarrinho.dados));
            atualizaCarrinhoCSS(acao, cardID, respMerge.dadosCarrinho);
          }
          atualizaCarrinhoCSS(acao, cardID, null);
        }
        else {
          ErroAjax(respMerge);
          return false;
        }
      },
      error: function (erro) {
        ErroAjax('error', 'conexao/servidor', 's');
        //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_025)');
        return false;
      },
    });
  }

  function lista_prateleira(listar_preferidos, opSorteio) {
    var ktmp = Date.now();
    app.dialog.preloader('Aguarde...');

    if (listar_preferidos == 'sim') {
      localStorage.setItem("numeros_preferidosPrateleira", localStorage.getItem("numeros_preferidos"));
    }
    // Token JWT
    var jwt = localStorage.getItem("jwt");
    var dataC = {
      user_login: localStorage.getItem("user_login"),
      listar_preferidos: listar_preferidos,
      numeros_preferidos: localStorage.getItem("numeros_preferidos"),
      ops: opSorteio
    };
    var dataD = {
      ktmp: ktmp,
      device: localStorage.getItem("device"),
    };
    var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
    var dataD = JSON.stringify(dataD);
    //console.log(opSorteio);
    app.request({
      url: servidor + '/api_public/titulos/lista_prateleiraMulti.php',
      beforeSend: function (request) {
        request.setRequestHeader('Authorization', 'Bearer ' + jwt);
        request.setRequestHeader("chaveapp", chaveAPP);
        request.setRequestHeader("versaoapp", versaoAPP);
      },
      //async: false,
      method: 'POST',
      dataType: 'json',
      crossDomain: true,
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
        var idTitulo = 0; // Se fosse adicionar + titulos (APPEND) esse numero deveria ser acrescido
        if (respMerge.status == "ok") {
          var todosSorteios = JSON.parse(localStorage.getItem("todosSorteios"));
          var qtd_num_sorte = todosSorteios[opSorteio].dados.qtd_num_sorte;
          var giro_extra = todosSorteios[opSorteio].dados.giro_extra;

          //var dadosSorteioAberto = JSON.parse(localStorage.getItem("dadosSorteioAberto"));
          //var qtd_num_sorte = dadosSorteioAberto.qtd_num_sorte;
          //var giro_extra = dadosSorteioAberto.giro_extra;


          $.each(respMerge.titulos, function (index, titulo) {
            code = "";

            if (titulo.tipo_sorteio == 1) {
              code = escreverTitulo1(titulo, idTitulo, listar_preferidos, localStorage.getItem("numeros_preferidos"), qtd_num_sorte, giro_extra);
            }
            else if (titulo.tipo_sorteio == 2) {
              code = escreverTitulo2(titulo, idTitulo, listar_preferidos, localStorage.getItem("numeros_preferidos"), qtd_num_sorte, giro_extra);
            }
            else if (titulo.tipo_sorteio == 3) {
              code = escreverTitulo3(titulo, idTitulo, listar_preferidos, localStorage.getItem("numeros_preferidos"), qtd_num_sorte, giro_extra);
            }
            idTitulo = idTitulo + 1;
            $('.titulos').append(code);
            atualizaQtdItensCarrinhoMulti();
          });
          $(".bt-add-rm-carrinho").click(function () {
            var cardID = $(this).attr('cardID');
            var btID = $(this).attr('id');
            btn_add_rm_itens(cardID, btID);
          });
        }
        else {
          //ErroAjax(respMerge);
          return false;
        }
      },
      error: function (erro) {
        //ErroAjax('error', 'conexao/servidor', 's');
        //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_026)');
        return false;
      },
    });
  }

  function btn_add_rm_itens(cardID, btID) {
    app.dialog.preloader('Atualizando...');
    var estoqueID = $("#card-" + cardID).attr('estoqueid');
    if (btID.substring(0, 5) == "bt-ad") {

      //console.log('add');
      atualizaCarrinho(estoqueID, 'add', cardID, opSorteio);
    }
    else if (btID.substring(0, 5) == "bt-rm") {
      //console.log('rm');
      atualizaCarrinho(estoqueID, 'rm', cardID, opSorteio);
    }
  };

  // Elimina numeros duplicados do array
  function eliminaNumPreferidoDuplicado(arr) {
    var i,
      len = arr.length,
      out = [],
      obj = {};

    for (i = 0; i < len; i++) {
      obj[arr[i]] = 0;
    }
    for (i in obj) {
      out.push(i);
    }
    return out;
  }

  // Funcao para ordenar o Array Num Preferido
  function ordenarNumPreferido(a, b) {
    return (a - b) //faz com que o array seja ordenado numericamente e de ordem crescente.
  }

  // Escreve os números da Preferido nos campos
  function carregarNumPreferido(NumPreferido) {
    if (NumPreferido) {
      var arrNumPreferido = NumPreferido.split(";");
      var num1, num2, num3, num4 = "";

      if ((!arrNumPreferido[0]) || (arrNumPreferido[0] == undefined) || (arrNumPreferido[0] == "") || (arrNumPreferido[0] == "null") || (arrNumPreferido[0] == "NaN")) {
        $("#text-NumPreferido1").text('');
      } else {
        num1 = parseInt(arrNumPreferido[0], 10);
        if (num1 < 10) { $("#text-NumPreferido1").text("0" + num1); }
        else { $("#text-NumPreferido1").text(num1); }
      }

      if ((!arrNumPreferido[1]) || (arrNumPreferido[1] == undefined) || (arrNumPreferido[1] == "") || (arrNumPreferido[1] == "null") || (arrNumPreferido[1] == "NaN")) {
        $("#text-NumPreferido2").text('');
      } else {
        num2 = parseInt(arrNumPreferido[1], 10);
        if (num2 < 10) { $("#text-NumPreferido2").text("0" + num2); }
        else { $("#text-NumPreferido2").text(num2); }
      }

      if ((!arrNumPreferido[2]) || (arrNumPreferido[2] == undefined) || (arrNumPreferido[2] == "") || (arrNumPreferido[2] == "null") || (arrNumPreferido[2] == "NaN")) {
        $("#text-NumPreferido3").text('');
      } else {
        num3 = parseInt(arrNumPreferido[2], 10);
        if (num3 < 10) { $("#text-NumPreferido3").text("0" + num3); }
        else { $("#text-NumPreferido3").text(num3); }
      }

      if ((!arrNumPreferido[3]) || (arrNumPreferido[3] == undefined) || (arrNumPreferido[3] == "") || (arrNumPreferido[3] == "null") || (arrNumPreferido[3] == "NaN")) {
        $("#text-NumPreferido4").text('');
      } else {
        num4 = parseInt(arrNumPreferido[3], 10);
        if (num4 < 10) { $("#text-NumPreferido4").text("0" + num4); }
        else { $("#text-NumPreferido4").text(num4); }
      }
    }
    else {
      $("#text-NumPreferido1").text('');
      $("#text-NumPreferido2").text('');
      $("#text-NumPreferido3").text('');
      $("#text-NumPreferido4").text('');
    }
  }

  function salvarServidorNumPreferido(NumPreferido) {
    var ktmp = Date.now();
    app.dialog.preloader('Atualizando...');

    var dataC = {
      user_login: localStorage.getItem("user_login"),
      cpf: localStorage.getItem("cpf"),
      numeros_preferidos: NumPreferido
    };
    var dataD = {
      ktmp: ktmp,
      device: localStorage.getItem("device"),
    };
    var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
    var dataD = JSON.stringify(dataD);

    app.request({
      url: servidor + '/api_public/numeros_preferidos/atualiza_numeros_preferidos.php',
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("jwt"));
        request.setRequestHeader("chaveapp", chaveAPP);
        request.setRequestHeader("versaoapp", versaoAPP);
      },
      //async: false,
      method: 'POST',
      dataType: 'json',
      crossDomain: true,
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
        if (respMerge.status == "erro") {
          ErroAjax(respMerge);
          return false;
        }
      },
      error: function (erro) {
        ErroAjax('error', 'conexao/servidor', 's');
        //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_027)', 's');
      },
      complete: function () { }
    });

  }
  // ********** FIM NUMEROS PREFERIDOS/FAVORITOS********** 

  //SelecionaCAP
  function escreverTitulo1(titulo, id, listar_preferidos, numeros_preferidos, qtd_num_sorte, giro_extra) {
    // Verifica se o título está no carrinho
    if (titulo.status == "AC") {
      var classeCard = "cartela-card-add";
      var classeHeader = "cartela-card-header-add";
      var btnStyleADD = "display: none;";
      var btnStyleRM = "";
    }
    else {
      var classeCard = "";
      var classeHeader = "";
      var btnStyleADD = "";
      var btnStyleRM = "display: none;";
    }
    if (listar_preferidos == "sim") {
      var classeBola = 'circulo2-preferido';
    }
    else {
      var classeBola = 'circulo2';
    }

    if (numeros_preferidos) {
      var arrayNP = numeros_preferidos.split(";");
    }
    else {
      var arrayNP = "";
    }

    var numTituloID = parseInt(titulo.titulo1);
    var numTituloID_str = numTituloID.toLocaleString('pt-br', { minimumFractionDigits: 0 });

    var numSorteID1 = numTituloID;
    var numSorteID1_str = numTituloID_str;

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
    var qtd_titulos_direita = parseInt(qtd_num_sorte) + parseInt(giro_extra);
    var estoqueID = titulo.pk_estoque_v;

    var bolasStr = titulo.combinacao1;
    var numBolas = bolasStr.split("-");

    var numsTitulos = numSorteID1; // Titulo único / simples chance
    var code = "";

    var code = "";
    code += "           <!-- MODELO 1 TITULO-->";
    code += "          <div id='card-" + id + "' class='card card-titulo " + classeCard + "' numsTitulos='" + numsTitulos + "' tipoTitulo='1'";
    code += "            estoqueID='" + estoqueID + "'>";
    code += "            <!-- CAB-TITULO -->";
    code += "            <div id='header-" + id + "' class='card-header cartela-card-header-vertical " + classeHeader + "'>";
    code += "              <div class='row' style='margin-left: 2px;margin-right: 2px; width: 100%;'>";
    code += "                <div class='col-45' style='float: left;'>";
    code += "                  <p class='label'";
    code += "                    style='margin-top: 0px;margin-bottom: 0px;float: left;font-size: 0.8rem;text-align: center;'>";
    code += "                    <span style='font-size: 0.7rem;'>" + nomeProduto + "<\/span>";
    code += "                    <span class='span-numTitulo' style='display: block;'>" + numTituloID_str + "<\/span>";
    code += "                  <\/p>";
    code += "                <\/div>";
    code += "                <div class='col-55' style='float: right;'>";

    if (qtd_titulos_direita == 1) {
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
        code += "                  <br><p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
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
        //code2 += "<div class='circulo2'>" + value + "<\/div>";
        // Se o valor da Bola está em numeros preferidos 2 metodos de analise (metodo 1)
        if (arrayNP.includes(value)) {
          code2 += "<div class='" + classeBola + "'>" + value + "<\/div>";
        }
        // Se o valor da Bola está em numeros preferidos 2 metodos de analise (metodo 2)
        else if (arrayNP.includes(String(parseInt(value)))) {
          code2 += "<div class='" + classeBola + "'>" + value + "<\/div>";
        }
        // Se bola nao é preferida, classe padrao
        else {
          code2 += "<div class='circulo2'>" + value + "<\/div>";
        }
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
    code += "            <div class='card-footer card-footer-titulo' style='justify-content: center;'>";
    code += "              <img cardID='" + id + "' id='bt-add-" + id + "' src='img\/selecionarcap\/bt-add.png' alt='' class='bt-add-rm-carrinho'";
    code += "                style='" + btnStyleADD + "'>";
    code += "              <img cardID='" + id + "' id='bt-rm-" + id + "' src='img\/selecionarcap\/bt-rm.png' alt='' class='bt-add-rm-carrinho'";
    code += "                style='" + btnStyleRM + "'> <\/div>";
    code += "          <\/div><!-- FIM MODELO 1 TITULO-->";
    return code;
  }

  function escreverTitulo2(titulo, id, listar_preferidos, numeros_preferidos, qtd_num_sorte, giro_extra) {
    // Verifica se o título está no carrinho
    if (titulo.status == "AC") {
      var classeCard = "cartela-card-add";
      var classeHeader = "cartela-card-header-add";
      var btnStyleADD = "display: none;";
      var btnStyleRM = "";
    }
    else {
      var classeCard = "";
      var classeHeader = "";
      var btnStyleADD = "";
      var btnStyleRM = "display: none;";
    }
    if (listar_preferidos == "sim") {
      var classeBola = 'circulo-preferido';
    }
    else {
      var classeBola = 'circulo';
    }

    if (numeros_preferidos) {
      var arrayNP = numeros_preferidos.split(";");
    }
    else {
      var arrayNP = "";
    }

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
    var qtd_titulos_direita = parseInt(qtd_num_sorte) + parseInt(giro_extra);
    var estoqueID = titulo.pk_estoque_v;

    var bolasStr = titulo.combinacao1;
    var numBolas = bolasStr.split("-");

    var bolasStr2 = titulo.combinacao2;
    var numBolas2 = bolasStr2.split("-");

    var numsTitulos = numSorteID1 + ";" + numSorteID2; // Titulo único / simples chance
    var code = "";

    code += "          <!-- MODELO 2 TITULOS -->";
    code += "          <div id='card-" + id + "' class='card card-titulo " + classeCard + "' numsTitulos='" + numsTitulos + "' tipoTitulo='2'";
    code += "            estoqueID='" + estoqueID + "'>";
    code += "            <!-- CAB-TITULO -->";
    code += "            <div id='header-" + id + "' class='card-header cartela-card-header-vertical " + classeHeader + "'>";
    code += "                <div class='col-45' style='float: left;width: 60%;'>";
    code += "                  <p class='label'";
    code += "                    style='margin-top: 0px;margin-bottom: 0px;float: left;font-size: 0.8rem;text-align: center;'>";
    code += "                    <span style='font-size: 0.7rem;'>" + nomeProduto + "<\/span>";
    code += "                    <span class='span-numTitulo' style='display: block;'>" + numTituloID_str + "<\/span>";
    code += "                  <\/p>";
    code += "                <\/div>";
    code += "                <div class='col-55' style='float: right;'>";

    if (qtd_titulos_direita == 1) {
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
        code += "                  <br><p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 2: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID2_str + "<\/span>";
        code += "                  <\/p>";
      }
      if ((parseInt(giro_extra) == 1) && (numTituloExtra_str != "")) {
        //  1 Titulo e 1 Rodada Extra
        code += "                  <br><p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
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
        //console.log([arrayNP, value,parseInt(value)]);
        if (count == 1) { code2 += "<div class='row row-titulo2'>"; }

        // Se o valor da Bola está em numeros preferidos 2 metodos de analise (metodo 1)
        if (arrayNP.includes(value)) {
          code2 += "<div class='" + classeBola + "'>" + value + "<\/div>";
        }
        // Se o valor da Bola está em numeros preferidos 2 metodos de analise (metodo 2)
        else if (arrayNP.includes(String(parseInt(value)))) {
          code2 += "<div class='" + classeBola + "'>" + value + "<\/div>";
        }
        // Se bola nao é preferida, classe padrao
        else {
          code2 += "<div class='circulo'>" + value + "<\/div>";
        }
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
        //code2 += "<div class='circulo'>" + value + "<\/div>";
        if (arrayNP.includes(value)) {
          code2 += "<div class='" + classeBola + "'>" + value + "<\/div>";
        }
        else {
          code2 += "<div class='circulo'>" + value + "<\/div>";
        }
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
    code += "            <div class='card-footer card-footer-titulo' style='justify-content: center;'>";
    code += "              <img cardID='" + id + "' id='bt-add-" + id + "' src='img\/selecionarcap\/bt-add.png' alt='' class='bt-add-rm-carrinho'";
    code += "                style='" + btnStyleADD + "'>";
    code += "              <img cardID='" + id + "' id='bt-rm-" + id + "' src='img\/selecionarcap\/bt-rm.png' alt='' class='bt-add-rm-carrinho'";
    code += "                style='" + btnStyleRM + "'> <\/div>";
    code += "          <\/div><!-- FIM MODELO 2 TITULO-->";
    return code;
  }

  function escreverTitulo3(titulo, id, listar_preferidos, numeros_preferidos, qtd_num_sorte, giro_extra) {
    // Verifica se o título está no carrinho
    if (titulo.status == "AC") {
      var classeCard = "cartela-card-add";
      var classeHeader = "cartela-card-header-add";
      var btnStyleADD = "display: none;";
      var btnStyleRM = "";
    }
    else {
      var classeCard = "";
      var classeHeader = "";
      var btnStyleADD = "";
      var btnStyleRM = "display: none;";
    }
    if (listar_preferidos == "sim") {
      var classeBola = 'circulo2-preferido';
    }
    else {
      var classeBola = 'circulo2';
    }

    if (numeros_preferidos) {
      var arrayNP = numeros_preferidos.split(";");
    }
    else {
      var arrayNP = "";
    }

    if (isNaN(parseInt(qtd_num_sorte))) { qtd_num_sorte = parseInt(titulo.tipo_sorteio); }

    var numTituloID = parseInt(titulo.titulo1);
    var numTituloID_str = numTituloID.toLocaleString('pt-br', { minimumFractionDigits: 0 });

    var numSorteID1 = numTituloID;
    var numSorteID1_str = numTituloID_str;

    var numSorteID2 = parseInt(titulo.titulo2);
    var numSorteID2_str = numSorteID2.toLocaleString('pt-br', { minimumFractionDigits: 0 });

    var numSorteID3 = parseInt(titulo.titulo3);
    var numSorteID3_str = numSorteID3.toLocaleString('pt-br', { minimumFractionDigits: 0 });

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
    var qtd_titulos_direita = parseInt(qtd_num_sorte) + parseInt(giro_extra);
    var estoqueID = titulo.pk_estoque_v;

    var bolasStr = titulo.combinacao1;
    var numBolas = bolasStr.split("-");

    var bolasStr2 = titulo.combinacao2;
    var numBolas2 = bolasStr2.split("-");

    var bolasStr3 = titulo.combinacao3;
    var numBolas3 = bolasStr3.split("-");

    var numsTitulos = numSorteID1 + ";" + numSorteID2 + ";" + numSorteID3; // Titulo único / simples chance

    var code = "";
    code += "          <!-- MODELO 3 TITULOS -->";
    code += "          <div id='card-" + id + "' class='card card-titulo  " + classeCard + "' numsTitulos='" + numsTitulos + "' tipoTitulo='3'";
    code += "            estoqueID='" + estoqueID + "'>";
    code += "            <!-- CAB-TITULO -->";
    code += "            <div id='header-" + id + "' class='card-header cartela-card-header-vertical " + classeHeader + "'>";
    code += "                <div class='col-45' style='float: left;width: 60%;'>";
    code += "                  <p class='label'";
    code += "                    style='margin-top: 0px;margin-bottom: 0px;float: left;font-size: 0.8rem;text-align: center;'>";
    code += "                    <span style='font-size: 0.7rem;'>" + nomeProduto + "<\/span>";
    code += "                    <span class='span-numTitulo' style='display: block;'>" + numTituloID_str + "<\/span>";
    code += "                  <\/p>";
    code += "                <\/div>";
    code += "                <div class='col-55' style='float: right;'>";

    if (qtd_titulos_direita == 1) {
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
        code += "                  <br><p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 2: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID2_str + "<\/span>";
        code += "                  <\/p>";
      }
      else if (parseInt(qtd_num_sorte) == 3) {
        // 1 Titulo e 2 Numerow da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 1: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p>";
        code += "                  <br><p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 2: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID2_str + "<\/span>";
        code += "                  <\/p>";
        code += "                  <br><p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 3: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID3_str + "<\/span>";
        code += "                  <\/p>";
      }
      if ((parseInt(giro_extra) == 1) && (numTituloExtra_str != "")) {
        //  1 Titulo e 1 Rodada Extra
        code += "                  <br><p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>" + textoDadoAppJS.dadosComum.premioExtra + " : <\/span>";
        code += "                    <span class='span-numSorte'>" + numTituloExtra_str + "<\/span>";
        code += "                  <\/p>";
      }
    }

    code += "                <\/div>";
    //code += "              <\/div>";
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
        //code2 += "<div class='circulo2'>" + value + "<\/div>";
        // Se o valor da Bola está em numeros preferidos 2 metodos de analise (metodo 1)
        if (arrayNP.includes(value)) {
          code2 += "<div class='" + classeBola + "'>" + value + "<\/div>";
        }
        // Se o valor da Bola está em numeros preferidos 2 metodos de analise (metodo 2)
        else if (arrayNP.includes(String(parseInt(value)))) {
          code2 += "<div class='" + classeBola + "'>" + value + "<\/div>";
        }
        // Se bola nao é preferida, classe padrao
        else {
          code2 += "<div class='circulo2'>" + value + "<\/div>";
        }
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
        //code2 += "<div class='circulo2'>" + value + "<\/div>";
        if (arrayNP.includes(value)) {
          code2 += "<div class='" + classeBola + "'>" + value + "<\/div>";
        }
        else {
          code2 += "<div class='circulo2'>" + value + "<\/div>";
        }
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
        //code2 += "<div class='circulo2'>" + value + "<\/div>";
        if (arrayNP.includes(value)) {
          code2 += "<div class='" + classeBola + "'>" + value + "<\/div>";
        }
        else {
          code2 += "<div class='circulo2'>" + value + "<\/div>";
        }
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
    code += "            <div class='card-footer card-footer-titulo' style='justify-content: center;'>";
    code += "              <img cardID='" + id + "' id='bt-add-" + id + "' src='img\/selecionarcap\/bt-add.png' alt='' class='bt-add-rm-carrinho'";
    code += "                style='" + btnStyleADD + "'>";
    code += "              <img cardID='" + id + "' id='bt-rm-" + id + "' src='img\/selecionarcap\/bt-rm.png' alt='' class='bt-add-rm-carrinho'";
    code += "                style='" + btnStyleRM + "'> <\/div>";
    code += "          <\/div><!-- FIM MODELO 3 TITULOS-->";
    return code;
  }

});


