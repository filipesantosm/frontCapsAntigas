jQuery(function () {
  var ktmp = Date.now();
  // ver problema na APPLe na linha Date(dtI);

  // Badge - Sinalização de Compra e de itens no rcarrinho
  badgeCompraSemana('sorteios-badge-qtd-comprada'); // cada pagina tem um id
  badgeCarrinhoEmAberto('sorteios-badge-qtd-carrinho');// cada pagina tem um id

  // Se estiver Offline mostra a faixa vermelha
  FaixaConexao();

  // Token JWT
  var jwt = localStorage.getItem("jwt");

  // Valores iniciais
  localStorage.setItem("qtdSorteiosTMP", 0);
  localStorage.removeItem("DataInicial");
  localStorage.removeItem("DataFinal");
  localStorage.removeItem("sorteiosTMP");
  var qtdSorteios = 0;
  var qdtMAXSorteios = 10;
  var allowInfinite = true;

  async function verificaProximasDatas(dtI, dtF, tipo) {
    var somaMes = 0;
    if (tipo == 'inicio') {
      var inicial = new Date();
      var final = new Date();
      somaMes = 1;
    }
    else {
      var inicial = new Date(dtI);
      var final = new Date(dtI); // PEGA A ULTIMA DATA INICIAL
    }

    inicial.setMonth(inicial.getMonth() - 1); // set last month
    inicial.setDate(1);// 1 will result in the first day of the month
    inicial.setHours(00, 00, 00, 00); // Set the first time
    localStorage.setItem("DataInicial", inicial);
    final.setMonth(final.getMonth() + somaMes); // set next month
    final.setDate(0); // 0 will result in the last day of the previous month
    final.setHours(23, 59, 59, 00); // Set last time
    localStorage.setItem("DataFinal", final);

  }

  function sorteiosHtml(sorteios) {
    var qtdSorteios = parseInt(localStorage.getItem("qtdSorteiosTMP"));
    var dados = sorteios.dados;
    var qtd = sorteios.qtd;
    var htmlFinal = '';
    for (i = 0; i < qtd; i++) {
      qtdSorteios = qtdSorteios + 1;
      htmlFinal += escreveSorteio(dados[i], qtdSorteios);
    }
    $$('.addSorteios').append(htmlFinal);
    localStorage.setItem("qtdSorteiosTMP", qtdSorteios);
    popupImgSorteio();
  }

  function escreveSorteio(sorteio, qtdSorteios) {
    // ***** CORRIGE ALTURA e LARGURA DO BANNER *********

    var widthApp = $("#addSorteios").width();
    var bannerwidth = widthApp - 40; // 10px de cada lado para o card e 10px de cada lado p ID sorteio
    if (device.platform == 'WEBAPP') { bannerwidth = bannerwidth - 16; }
    var bannerHeight = (bannerwidth / 1.7778); // 1980 / 1080 = 1.7778
    var html = '';
    var d = new Date();

    //var dataSorteio = new Date(sorteio.data_sorteio);
    var dataSorteio = novaDataJS(sorteio.data_sorteio, 'yyyy-mm-dd hh:mm:ss');

    var novoValor = dataSorteio.toLocaleString('pt-BR', { dateStyle: 'medium' }); // outra opçao: medium, short , long

    html += '<div class="card card-sorteio" id="' + sorteio.id + '" idOrdem="' + qtdSorteios + '">';
    html += '<div id="sorteioId-' + sorteio.id + '" class="card-header card-sorteio-header">' + novoValor + '</div>';
    html += '<div class="card card-sorteio-header-pic" style="box-shadow: none !important;">';
    html += '<div name="blog-img" legenda="' + novoValor + '" id="blog-img-' + qtdSorteios + '" style="width:' + bannerwidth + 'px !important;height:' + bannerHeight + 'px !important;background-image:url(' + sorteio.img + ')"';
    html += 'class="card-header align-items-flex-end color-white"></div>';
    html += '<div class="card-content color-white">'; //blog-content-padding

    html += '<p id="blog-data-' + qtdSorteios + '" class="date color-white">SUSEP: ' + sorteio.processo_susep + '</p>';
    html += '<p id="blog-prefacio-' + qtdSorteios + '">' + sorteio.obs + '</p></div>';
    var premios = sorteio.premios.split("¬").join("<br>");

    html += '<p id="blog-prefacio-' + qtdSorteios + '">' + premios + '</p></div>';
    html += '</div></div>';
    return html;
  }

  async function Passo1() { // Obtém dadas de controle
    // useless await here
    await verificaProximasDatas('', '', 'inicio');
  }

  async function Passo2() { // Obtém o histórico doss sorteios 

    var dataI = new Date(localStorage.getItem("DataInicial"));
    //var dataI = novaDataJS(localStorage.getItem("DataInicial"), 'yyyy-mm-dd hh:mm:ss'); 
    var dataF = new Date(localStorage.getItem("DataFinal"));
    //var dataF = novaDataJS(localStorage.getItem("DataFinal"), 'yyyy-mm-dd hh:mm:ss'); 

    app.dialog.preloader('Pesquisando');
    var dataC = {
      user_login: localStorage.getItem("user_login"),
      DataInicial: dataI.toLocaleString('pt-br'),
      DataFinal: dataF.toLocaleString('pt-br')
    };
    var dataD = {
      ktmp: ktmp,
      device: localStorage.getItem("device")
    };

    var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
    var dataD = JSON.stringify(dataD);
    const result = await app.request({
      url: servidor + '/api_public/sorteios/concluidos.php',
      beforeSend: function (request) {
        request.setRequestHeader('Authorization', 'Bearer ' + jwt);
        request.setRequestHeader("chaveapp", chaveAPP);
        request.setRequestHeader("versaoapp", versaoAPP);
      },
      async: true,
      method: 'POST',
      dataType: 'json',
      crossDomain: true,
      data: {
        a: JSON.stringify(criptoDadosEnviado(ktmp, ktmp)),
        c: dataC,
        d: dataD
      },
      success: function (resposta) {
        app.preloader.hide();
        app.dialog.close();
        var resp = descriptDadosRecebido(resposta, ktmp);
        var respMerge = { ...resp.d, ...resp.c, ...resp.a };

        if (respMerge.status == "ok") {
          if (respMerge.qtd == 0) {

            $('#block-btn-adicionar').hide();
            $('#cardFim').show();
            app.preloader.hide();
            app.dialog.close();
            return true;
          }
          else {

            localStorage.setItem("sorteiosTMP", JSON.stringify(respMerge));
            sorteiosHtml(respMerge);
            return true;
          }
        }
        else {
          ErroAjax(respMerge);
          return false;
        }
      },
      error: function (erro) {
        ErroAjax('error', 'conexao/servidor');
        //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_028)', 's');
      },
      complete: function () {
        app.preloader.hide();
        app.dialog.close();
      }
    });
  }


  // Call start
  (async () => {
    await Passo1();// Get Datas 
    await Passo2(); // listaSorteios
  })();

  $('#btn-adicionar').on('click', function () {
    var qtdSorteiosTMP = localStorage.getItem("qtdSorteiosTMP")
    if (qtdSorteiosTMP >= qdtMAXSorteios) {
      $('#block-btn-adicionar').hide();
      $('#cardFim').show();
    } else {
      app.dialog.preloader();
      verificaProximasDatas(localStorage.getItem("DataInicial"), localStorage.getItem("DataFinal"), 'add');
      Passo2();// listaSorteios
    }
  });

  // *************** POPUP *******************//
  // Abrir POPUP com a imagem ao clicar na foto do banner
  function popupImgSorteio() {
    $('div[name="blog-img"]').on("click", function () {
      var img = $(this).css('background-image');
      img = img.replace('url(', '').replace(')', '').replace(/\"/gi, "");
      var legenda = $(this).attr('legenda');
      var myPhotoBrowserPopupDark = app.photoBrowser.create({
        //photos: [img],
        photos: [{ url: img, caption: legenda }],
        theme: 'dark',
        type: 'popup',
        popupCloseLinkText: 'Fechar',
        toolbar: false
      });
      myPhotoBrowserPopupDark.open();
    });
    // FIM POPUP 
  }
});