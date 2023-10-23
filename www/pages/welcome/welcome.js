jQuery(function () {   // browser-sync -w -server
  var ktmp = Date.now();

  configuraMultiSorteios("WWAPP_");
  configuraLayoutWelcome();

  $("button[id='WWAPP_sel_produto_1']").on('click', function () {
    var produto = $(this).val();
    configuraSelecaoProdutos(produto, '1', 'WWAPP_');
  });

  $("button[id='WWAPP_sel_produto_2']").on('click', function () {
    var produto = $(this).val();
    configuraSelecaoProdutos(produto, '2', 'WWAPP_');
  });

  $("button[id='WWAPP_sel_produto_3']").on('click', function () {
    var produto = $(this).val();
    configuraSelecaoProdutos(produto, '3', 'WWAPP_');
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
      /*type: 'popup', */
      popupCloseLinkText: 'Fechar',
      toolbar: false
    });
    myPhotoBrowserPopupDark.open();

    setTimeout(function () {
      myPhotoBrowserPopupDark.close();
    }, 5000);//Voltar aqui para 4000

  });

  // LOGIN ou Criar usuario
  $("#WWAPP_btn_login").on("click", function () {
    criaBotaoCPF('login');
  });



  // *************** copyright *******************//
  $('#WWAPP_dev_welcome').on('click', function () {
    window.open(copyright_site, '_blank');
  });

  $("#login-desenvolidoPor").text(copyright_desenvolvidoPor);
  $("#login-versaoAPP").text(copyright_versaoAPP);
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


  // *************** captcha *******************//
  
  // altera o tamanho do popUp, visto que no iphone n funcionou o media query
  $$('.popup-captcha').on('popup:open', function (e) {
    $('#captchaNum').mask('0-0-0-0');
    var appH = parseInt($("#app").height());
    if (appH < 600) {
      $(this).removeClass('popup-captcha-height-35');
      $(this).addClass('popup-captcha-height-40');
    }
    else {
      $(this).removeClass('popup-captcha-height-40');
      $(this).addClass('popup-captcha-height-35');
    }
  });

  $('.popup-captcha').on('popup:open', function (e) {
    $('#captchaNum').mask('0-0-0-0');
    var CPFinformado = localStorage.getItem("tmp_cpf");
    if (validaCpfCnpj(CPFinformado)) {
      var cpf_formatado = CPFinformado.replace(/\./g, '');
      cpf_formatado = cpf_formatado.replace(/\-/g, '');
      cpf_formatado = cpf_formatado.replace(/\ /g, '');
      $('#iframe_captcha').attr('src', servidor + "/api_public/captcha/?p=w&cpf=" + cpf_formatado + "&a=" + encodeURIComponent(criptoDados(ktmp, ktmp)));
    }
  });

  $('.popup-captcha').on('popup:closed', function (e) {
    dadoCaptcha = "";
    $('#iframe_captcha').attr('src', " ");
    app.popup.close();
    app.dialog.close();
    app.actions.close();
    localStorage.removeItem("tmp_cpf");
  });

  $('#btn-ValidaCapctha').on('click', function () {
    var captcha = $('#captchaNum').val();
    var acao = $('#hidden_popup_acao').val();
    captcha = captcha.replace(/\ /g, '');
    captcha = captcha.replace(/\./g, '');
    captcha = captcha.replace(/\-/g, '');
    if (captcha.length == 4) {
      $('#captchaNum').val("");
      app.popup.close();
      app.dialog.close();
      app.actions.close();
      $('#iframe_captcha').attr('src', " ");
      pesquisaCPF(localStorage.getItem("tmp_cpf"), acao, captcha);
      localStorage.removeItem("tmp_cpf");
    }
    else {
      ErroValidacao('Verifique o valor informado e tente novamente!');
    }

  });
  // *************** FIM captcha *******************//

  // *************** Atualiza Telefone de suporte Whatsapp *******************//
  var novoTelSuporte = 'https://wa.me/' + localStorage.getItem("telSuporte") + '/?text=Ol%c3%a1%21%20Estou%20com%20dificuldades%20para%20cadastrar%20o%20captcha%2c%20poderia%20me%20ajudar%3f';
  $("#welcome_suporteWA").attr("href", novoTelSuporte);
  // *************** FIM Atualiza Telefone de suporte Whatsapp *******************//

  // *************** Funcoes *******************//
  function configuraLayoutWelcome() {
    var todosSorteios = JSON.parse(localStorage.getItem("todosSorteios"));
    if (todosSorteios.totalSorteiosAbertos > 0) {
      $('#WWAPP_div_falta_pouco').hide();
      localStorage.setItem("SorteioBloqueado", 'false');
      $('#WWAPP_cardObsSemSorteio').hide();
      $('#WWAPP_sel_produtos').show();
      $('#WWAPP_banner_produtos').show();
    }
    else {
      $('#WWAPP_div_falta_pouco').show();
      localStorage.setItem("SorteioBloqueado", 'true');
      $('#WWAPP_cardObsSemSorteio').show();
      $('#WWAPP_sel_produtos').hide();
      $('#WWAPP_banner_produtos').hide();

      var widthApp = $("#app").width();
      var bannerHeight = ((widthApp - 20) / 1.7778); // 1980 / 1080 = 1.7778
      $(".falta-pouco").css("height", bannerHeight + 'px');
    }
  }

  function pesquisaCPF(CPFinformado, acao, captcha) {
    if (CPFinformado) {
      var caracteresDigitados = CPFinformado.length;
      if (caracteresDigitados == 14) {
        if (!validaCpfCnpj(CPFinformado)) {
          ErroValidacao('Favor informar um CPF válido.');
          return false;
        }
        else {
          app.dialog.preloader('Pesquisando CPF');
          cpf = CPFinformado.replace(/[^0-9]/g, '');

          var dataC = {
            cpf: cpf
          };
          var dataD = {
            ktmp: ktmp,
            device: localStorage.getItem("device"),
            captcha: captcha
          };
          var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
          var dataD = JSON.stringify(dataD);

          app.request({
            url: servidor + '/api_public/cpf_cnpj/valida_cpf.php',
            beforeSend: function (request) {
              request.setRequestHeader("Authorization", "Bearer " + "novo_cadastro");
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
              app.preloader.hide();
              app.dialog.close();
              var resp = descriptDadosRecebido(resposta, ktmp);
              var respMerge = { ...resp.d, ...resp.c, ...resp.a };
              if (respMerge.status) {
                // Cadastro Manual habilitado ou desabilitado
                if (respMerge.status == "ok") {
                  if (respMerge.direcionar) {
                    var arrayDirecionar = ['login', 'cadastro_p1', 'cadastro_p2', 'cadastro_p3'];
                    if (arrayDirecionar.includes(respMerge.direcionar.toLowerCase())) {
                      if (localStorage.getItem("telSuporte")) { var telSuporte = localStorage.getItem("telSuporte"); }
                      if (localStorage.getItem("tel_mkt")) { var tel_mkt = localStorage.getItem("tel_mkt"); }
                      if (localStorage.getItem("linkAtualizacao")) { var linkAtualizacao = localStorage.getItem("linkAtualizacao"); }

                      localStorage.clear();
                      if (acao == 'comprar') {
                        var stepper = app.stepper.get('.stepper');
                        var qtdTitulos = stepper.value;
                        localStorage.setItem("WWAPP_comprar", qtdTitulos);
                      }
                      else {
                        localStorage.removeItem("WWAPP_comprar");
                      }

                      //if (linkAtualizacao) { localStorage.setItem("linkAtualizacao", linkAtualizacao); }
                      if (respMerge.linkAtualizacao) { localStorage.setItem("linkAtualizacao", respMerge.linkAtualizacao); }
                      else { localStorage.setItem("linkAtualizacao", linkAtualizacao); }
                      if (telSuporte) { localStorage.setItem("telSuporte", telSuporte); }
                      if (tel_mkt) { localStorage.setItem("tel_mkt", tel_mkt); }
                      // Validar Telefone
                      var vt = "";
                      if (respMerge.vt) { var vt = respMerge.vt; }
                      localStorage.setItem("device", JSON.stringify(device));
                      localStorage.setItem("conexao", "online");
                      localStorage.setItem("cpf", respMerge.dados.cpf);
                      localStorage.setItem("postDados", JSON.stringify(respMerge.dados));
                      corrigeTelWhatsapp(respMerge.telSuporte);
                      app.views.main.router.navigate('/' + respMerge.direcionar.toLowerCase() + '/' + vt);
                    }
                    else {
                      ErroAjax('error', 'Desculpe, tente novamente mais tarde!', 's');
                      return false;
                    }
                  }
                  else {
                    ErroAjax('error', 'Desculpe, tente novamente mais tarde!', 's');
                    return false;
                  }
                } else if (respMerge.cadM == "S") {
                  if (localStorage.getItem("telSuporte")) { var telSuporte = localStorage.getItem("telSuporte"); }
                  if (localStorage.getItem("tel_mkt")) { var tel_mkt = localStorage.getItem("tel_mkt"); }
                  if (localStorage.getItem("linkAtualizacao")) { var linkAtualizacao = localStorage.getItem("linkAtualizacao"); }
                  localStorage.clear();

                  if (respMerge.linkAtualizacao) { localStorage.setItem("linkAtualizacao", respMerge.linkAtualizacao); }
                  else { localStorage.setItem("linkAtualizacao", linkAtualizacao); }
                  if (telSuporte) { localStorage.setItem("telSuporte", telSuporte); }
                  if (tel_mkt) { localStorage.setItem("tel_mkt", tel_mkt); }

                  // Validar Telefone
                  var vt = "";
                  if (respMerge.vt) { var vt = respMerge.vt; }
                  localStorage.setItem("device", JSON.stringify(device));
                  localStorage.setItem("conexao", "online");
                  localStorage.setItem("cpf", cpf);
                  corrigeTelWhatsapp(respMerge.telSuporte);
                  localStorage.setItem("cadM", respMerge.cadM);
                  app.views.main.router.navigate('/cadastro_p1/N');

                } else {
                  ErroAjax(respMerge);
                  return false;
                }
              }
              else {
                ErroAjax('error', 'Desculpe, tente novamente mais tarde!', 's');
                return false;
              }
            },
            error: function (erro) {
              ErroAjax('error', 'conexao/servidor');
            },
            complete: function () { }
          });
        }
      }
      else {
        ErroValidacao('Favor informar um CPF válido.');
      }
    } else {
      ErroValidacao('Favor informar um CPF válido.');
    }
  };

  function criaBotaoCPF(acao) {
    $('#hidden_popup_acao').val(acao);
    if (localStorage.getItem("user_login")) { var user_login = localStorage.getItem("user_login"); } else { var user_login = ""; }

    var input_html = '<div class="dialog-input-field item-input">'
    input_html += '  <div class="item-input-wrap">'
    //input_html    += '    <input id="WWAPP_cpf" style="text-align: center;" class="dialog-input" type="tel" placeholder="Enter number" required validate pattern="[0-9]*" data-error-message="Only numbers please!">';
    if ((user_login) && (user_login != "")) {
      input_html += '    <input id="WWAPP_cpf" style="text-align: center;" class="dialog-input dialog-input-font" type="tel" value="' + user_login + '">';
    }
    else {
      input_html += '    <input id="WWAPP_cpf" style="text-align: center;" class="dialog-input dialog-input-font" type="tel">';
    }

    input_html += '</div></div>';
    app.dialog.create({
      title: null,
      text: 'Informe o número do seu C.P.F para localizar seu cadastro!',
      content: input_html,
      closeByBackdropClick: false, backdrop: true,
      buttons: [{ text: 'OK', cssClass: 'dialog-button-cor_1' }],
      onClick: function (dialog, index) {
        var CPFinformado = dialog.$el.find('.dialog-input').val();
        localStorage.setItem("tmp_cpf", CPFinformado);
        ktmp = Date.now();
        if (validaCpfCnpj(CPFinformado)) {
          app.popup.open('.popup-captcha', false);
          /*AQUI*/
          $('#captchaNum').focus();
        }
        else {
          localStorage.removeItem("tmp_cpf");
          app.popup.close();
          app.dialog.close();
          app.actions.close();
          ErroValidacao('Verifique o valor informado e tente novamente!');
        }
      },
      on: {
        open: function () {
          localStorage.removeItem("tmp_cpf");
          $('#captchaNum').val("");
        }
      }

    }).open();
    $('#WWAPP_cpf').mask('000.000.000-00');
    $('#WWAPP_cpf').focus();
  }

  function configuraCapitalizadora(produto, prefixo) {
    if (produto){
      var dadosCapitalizadora = JSON.parse(localStorage.getItem("dadosCapitalizadora"));
      $("#" + prefixo + "html_capitalizadora").html(dadosCapitalizadora[produto].texto_home);
      $("#" + prefixo + "img_capitalizadora").attr("src", dadosCapitalizadora[produto].imagem_logo);
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
            $("#" + prefixo + "sel_produto_" + contador).show();
            //var novaDataArray = sorteio.dados.data.split('-').reverse();
            //$("#" + prefixo + "dataOp" + contador).html("<br>" + novaDataArray.slice(0, novaDataArray.length - 1).join("/"));
            $("#" + prefixo + "valorOp" + contador).html("Valor unitário: " + converterParaMoeda(parseFloat(sorteio.dados.valor_venda), 'texto'));
            $("#" + prefixo + "dataSorteioOp" + contador).html("sorteio será realizado no dia: " + sorteio.dados.data.split('-').reverse().join('/'));
            $("#" + prefixo + "TituloBannerProduto" + contador).text(sorteio.dadosBanner.titulo_banner);
            imageUrl = sorteio.dadosBanner.img_banners;
            $(".bannerCardProdutoMulti_" + contador).css("background-image", "url(" + imageUrl + ")");
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
    configuraBanner(primeiroNumIdSorteio, 'WWAPP_');
    configuraSelecaoProdutos(primeiroIndex, primeiroNumIdSorteio, 'WWAPP_');
    configuraCapitalizadora(primeiroIndex, 'WWAPP_');
    if ((todosSorteios.totalSorteiosAbertos == 1) || (todosSorteios.totalSorteiosAbertos == '1')) {
      configuraRelogioSorteioUnico(primeiroIndex, primeiroNumIdSorteio, 'WWAPP_');
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

});
