jQuery(function () {
  // browser-sync -w -server

  configuraMultiSorteios("HOME_");
  configuraLayoutHome();

  var jwt = localStorage.getItem("jwt");

  $("button[id='HOME_sel_produto_1']").on('click', function () {
    var produto = $(this).val();
    configuraSelecaoProdutos(produto, '1', 'HOME_');
  });

  $("button[id='HOME_sel_produto_2']").on('click', function () {
    var produto = $(this).val();
    configuraSelecaoProdutos(produto, '2', 'HOME_');
  });

  $("button[id='HOME_sel_produto_3']").on('click', function () {
    var produto = $(this).val();
    configuraSelecaoProdutos(produto, '3', 'HOME_');
  });

  $(".banner_produtos_popup").on("click", function () {
    var img = $(this).css('background-image');
    img = img.replace('url(', '').replace(')', '').replace(/\"/gi, "");
    var legenda = $(this).attr('baner_titulo');
    var myPhotoBrowserPopupDark = app.photoBrowser.create({
      //photos: [img],
      photos: [{ url: img, caption: legenda }],
      theme: 'dark',
      type: 'standalone',
      popupCloseLinkText: 'Fechar',
      toolbar: false
    });
    myPhotoBrowserPopupDark.open();

    setTimeout(function () {
      myPhotoBrowserPopupDark.close();
    }, 5000);//Voltar aqui para 4000

  });

  // *************** COMPRAR *******************//
  // Direciona Continuar comprando / Selecionar Titulos Modelo 1 / ou FInalizar Compra
  $("[name='btn_comprar_p']").on("click", function () {
    var idp = $(this).attr('idp');
    var todosSorteios = JSON.parse(localStorage.getItem("todosSorteios"));
    if (localStorage.getItem("dadosUsuario")) {
      if ((localStorage.getItem("todosSorteios") == '') ||
        (todosSorteios[idp].dados.status_sorteio == 'BV')) {
        // bloqueado botao de comprar
      }
      else {
        var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
        if (dadosUsuario.cep_ativo == "S") {
          app.views.main.router.navigate('/selecionarcap/' + idp);
        }
        else {
          app.dialog.alert('Desculpe, produto ainda não disponível em sua região !', null);
          return false;
        }
      }
    }
  });

  // Direciona para o carrinho
  $("#btn_carrinho_concluir_compra").on("click", function () {
    var todosSorteios = JSON.parse(localStorage.getItem("todosSorteios"));
    var carrinhoMulti = JSON.parse(localStorage.getItem("carrinhoMulti"));

    if (localStorage.getItem("dadosUsuario")) {
      if ((localStorage.getItem("SorteioBloqueado") == 'true') || (todosSorteios.totalSorteiosAbertos == 0)) {
        // bloqueado botao de comprar
      }
      else {
        var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
        if (dadosUsuario.cep_ativo == "S") {
          var qtdTitulos = carrinhoMulti.totalCarrinho;
          var tipoTitulos = "carrinhoBanco";
          app.views.main.router.navigate('/carrinho/' + qtdTitulos + '/' + tipoTitulos);
        }
        else {
          app.dialog.alert('Desculpe, produto ainda não disponível em sua região !', null);
          return false;
        }
      }
    }
  });

  // Direciona para o carrinho COMPRA UNICA
  $("#unico_btn_comprar").on("click", function () {
    var todosSorteios = JSON.parse(localStorage.getItem("todosSorteios"));

    if (localStorage.getItem("dadosUsuario")) {
      if ((localStorage.getItem("SorteioBloqueado") == 'true') || (todosSorteios.totalSorteiosAbertos == 0)) {
        // bloqueado botao de comprar
      }
      else {
        if (localStorage.getItem("dadosUsuario")) {
          var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
          if (dadosUsuario.cep_ativo == "S") {

            var stepper2 = app.stepper.get('.stepper');
            var qtdTitulos = stepper2.value;
            var tipoTitulos = "aleatorio";
            app.views.main.router.navigate('/carrinho/' + qtdTitulos + '/' + tipoTitulos);
          }
          else {
            app.dialog.alert('Desculpe, produto ainda não disponível em sua região !', null);
            return false;
          }
        }
      }
    }
  });
  // ***************FIM  COMPRAR *******************//


  // *************** copyright *******************//
  $('#HOME_dev_home').on('click', function () {
    window.open(copyright_site, '_blank');
  });

  $("#home-desenvolidoPor").text(copyright_desenvolvidoPor);
  $("#home-versaoAPP").text(copyright_versaoAPP);
  // *************** FIM copyright *******************//


  // *************** PUSH PARA ATUALIZAR *******************//
  var $ptrContent = $$('.ptr-content');
  // Add 'refresh' listener on it
  $ptrContent.on('ptr:refresh', function (e) {
    setTimeout(function () {
      app.view.current.router.refreshPage();
    }, 100);
  });
  // *************** FIM PUSH PARA ATUALIZAR *******************//

  // *************** Se estiver Offline mostra a faixa vermelha *******************//
  FaixaConexao();
  if (localStorage.getItem("conexao") == 'offline') { return false; }
  // *************** FIM Se estiver Offline mostra a faixa vermelha *******************//


  // *************** DIRECIONAR BOLETO *******************//
  $('#HOME_btn_direcionar_boleto').on('click', function () {
    app.views.main.router.navigate('/comprarsaldo/');
  });

  if (habilitarBoleto == 'n') {
    $("#HOME_block-boleto").hide();
  }
  else {
    $("#HOME_block-boleto").show();
  }
  // *************** FIM DIRECIONAR BOLETO *******************//


  // *************** CONFIGURACOES CONFORME LOCAL *******************//
  ocultarConformeLocal('div_compre_agora');
  ocultarConformeLocal('div_carrinho_compras');
  ocultarConformeLocal('HOME_block-boleto');
  ocultarConformeLocal('btn_comprar_p1');
  ocultarConformeLocal('btn_comprar_p2');
  ocultarConformeLocal('btn_comprar_p3');
  // *************** FIM CONFIGURACOES CONFORME LOCAL *******************//


  // *************** Funcoes *******************//
  function configuraLayoutHome() {
    var todosSorteios = JSON.parse(localStorage.getItem("todosSorteios"));
    if (todosSorteios.totalSorteiosAbertos > 0) {
      $("#btn_carrinho_continuar_comprando").hide();
      if (todosSorteios.totalSorteiosAbertos == 1) {
        $("#btn_carrinho_continuar_comprando").show();
        $("#div_compre_agora").show();
      } else {
        $("#div_compre_agora").hide();
      }
      $('#HOME_div_falta_pouco').hide();
      localStorage.setItem("SorteioBloqueado", 'false');
      $('#HOME_cardObsSemSorteio').hide();
      $('#HOME_sel_produtos').show();
      $('#HOME_banner_produtos').show();
    }
    else {
      $('#HOME_div_falta_pouco').show();
      localStorage.setItem("SorteioBloqueado", 'true');
      $('#HOME_cardObsSemSorteio').show();
      $('#HOME_sel_produtos').hide();
      $('#HOME_banner_produtos').hide();
      $('#div_carrinho_compras').hide();

      var widthApp = $("#app").width();
      var bannerHeight = ((widthApp - 20) / 1.7778); // 1980 / 1080 = 1.7778
      $(".falta-pouco").css("height", bannerHeight + 'px');
    }
  }

  function configuraBanner(produto, prefixo) {
    $("#" + prefixo + "cardProduto1").hide();
    $("#" + prefixo + "cardProduto2").hide();
    $("#" + prefixo + "cardProduto3").hide();
    $("#" + prefixo + "cardProduto" + produto).show();

    $("#" + prefixo + "banner_produtos").removeClass("cardProduto1");
    $("#" + prefixo + "banner_produtos").removeClass("cardProduto2");
    $("#" + prefixo + "banner_produtos").removeClass("cardProduto3");
    $("#" + prefixo + "banner_produtos").addClass("cardProduto" + produto);
  }

  function configuraCapitalizadora(produto, prefixo) {
    if (produto) {
      var dadosCapitalizadora = JSON.parse(localStorage.getItem("dadosCapitalizadora"));
      $("#" + prefixo + "html_capitalizadora").html(dadosCapitalizadora[produto].texto_home);
      $("#" + prefixo + "img_capitalizadora").attr("src", dadosCapitalizadora[produto].imagem_logo);
    }
  }

  function configuraMultiSorteios(prefixo) {
    var todosSorteios = JSON.parse(localStorage.getItem("todosSorteios"));
    var labelSorteios = JSON.parse(localStorage.getItem("labelSorteios"));
    $("#" + prefixo + "label1_s").html(labelSorteios.label1_s);
    $("#" + prefixo + "label2_s").html(labelSorteios.label2_s);

    $("#" + prefixo + "label1_sm").html(labelSorteios.label1_sm);
    $("#" + prefixo + "label2_sm").html(labelSorteios.label2_sm);

    $("#" + prefixo + "label1_se").html(labelSorteios.label1_se);
    $("#" + prefixo + "label2_se").html(labelSorteios.label2_se);

    $("#" + prefixo + "sel_produto_1").hide();
    $("#" + prefixo + "sel_produto_2").hide();
    $("#" + prefixo + "sel_produto_3").hide();

    var imageUrl = "";
    var contador = 1;
    var primeiroNumIdSorteio = 0;
    var primeiroIndex = '';
    var arraySorteios = ['sorteios', 'sorteios_extra', 'sorteios_semanal'];

    $.each(todosSorteios, function (index, sorteio) {
      if (arraySorteios.includes(index)) {
        if ((sorteio.qtd == 1) || (sorteio.qtd == '1')) {
          if (sorteio.dados.status_sorteio == "AA") {
            $("#" + prefixo + "sel_produto_" + contador).val(index);

            if (primeiroNumIdSorteio == 0) { primeiroNumIdSorteio = contador; }
            if (primeiroIndex == '') { primeiroIndex = index; }

            $("#btn_comprar_p" + contador).attr('idp', index);
            $("#btn_carrinho_continuar_comprando").attr('idp', index);

            if (sorteio.dados.status_sorteio != "AA") {
              $("#btn_comprar_p" + contador).hide();
            }

            $("#" + prefixo + "sel_produto_" + contador).show();
            var novaDataArray = sorteio.dados.data.split('-').reverse();
            $("#" + prefixo + "dataOp" + contador).html("<br>" + novaDataArray.slice(0, novaDataArray.length - 1).join("/"));

            $("#" + prefixo + "valorOp" + contador).html("Valor unitário: " + converterParaMoeda(parseFloat(sorteio.dados.valor_venda), 'texto'));
            $("#" + prefixo + "dataSorteioOp" + contador).html("sorteio será realizado no dia: " + sorteio.dados.data.split('-').reverse().join('/'));
            $("#" + prefixo + "TituloBannerProduto" + contador).text(sorteio.dadosBanner.titulo_banner);
            imageUrl = sorteio.dadosBanner.img_banners;
            $(".bannerCardProdutoMulti_" + contador).css("background-image", "url(" + imageUrl + ")");
            //$("#" + prefixo + "bannerCardProduto" + contador).attr("baner_titulo" + contador, "titulo " + contador);
            $("#" + prefixo + "bannerCardProduto" + contador).attr("baner_titulo", sorteio.dadosBanner.titulo_banner);

          } else {
            $("#" + prefixo + "sel_produto_" + contador).remove();
          }
          contador = contador + 1;
        } else {
          $("#" + prefixo + "sel_produto_" + contador).remove();
          contador = contador + 1;
        }
      }
    });
    configuraBanner(primeiroNumIdSorteio, 'HOME_');
    configuraSelecaoProdutos(primeiroIndex, primeiroNumIdSorteio, 'HOME_');
    configuraCapitalizadora(primeiroIndex, 'HOME_');
    if ((todosSorteios.totalSorteiosAbertos == 1) || (todosSorteios.totalSorteiosAbertos == '1')) {
      $("#unico_link_selecionacap").attr('idp', primeiroIndex);
      $("#unico_btn_comprar").attr('idp', primeiroIndex);

      var str = todosSorteios[primeiroIndex].dados.valor_venda.toString();
      var res = str.replace(".", ",");
      $('#titulos-valor').text("Valor a pagar: R$ " + res);
      atualizaStepper(todosSorteios[primeiroIndex].dados.valor_venda);

      configuraRelogioSorteioUnico(primeiroIndex, primeiroNumIdSorteio, 'HOME_');

    }
  }


  function configuraSelecaoProdutos(produto, id, prefixo) {
    $('button[name="' + prefixo + 'sel_produto"]').each(function (index, item) {
      $(this).removeClass("segmentoMultiProduto_1_active");
      $(this).removeClass("segmentoMultiProduto_2_active");
      $(this).removeClass("segmentoMultiProduto_3_active");
      $(this).addClass("segmentoMultiProduto");
    });
    $("#" + prefixo + "sel_produto_" + id).removeClass("segmentoMultiProduto");
    $("#" + prefixo + "sel_produto_" + id).addClass("segmentoMultiProduto_" + id + "_active");
    configuraBanner(id, prefixo);
    configuraCapitalizadora(produto, 'WWAPP_');
  }
  // *************** stepper ****************//
  // Botão de adicionar títulos para compra //
  function atualizaStepper(valorTitulo) {

    $('.stepper').on('change', function () {
      var stepper = app.stepper.create({
        el: '.stepper',
        step: 1,
        min: 1,
        max: 100,
        value: 1,
      });
      stepper.valueEl = (stepper.value * (valorTitulo));

      var res = converterParaMoeda(parseFloat(stepper.valueEl), 'texto');
      var novoTexto = "Valor a pagar: ";
      novoTexto = novoTexto + res.toString() + " ";
      $('#titulos-valor').text(novoTexto);
    });
  }
  // FIM stepper
});
