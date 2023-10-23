jQuery(function () {
  var ktmp = Date.now();
  app.dialog.preloader();
  //PUSH PARA ATUALIZAR
  var $ptrContent = $$('.ptr-content');
  // Add 'refresh' listener on it
  $ptrContent.on('ptr:refresh', function (e) {
    setTimeout(function () {
      app.view.current.router.refreshPage();
    }, 100);
  });

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
    url: servidor + '/api_public/institucional/instituicoes.php',
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
      if (respMerge.status == "ok") {
        atualizaBlogs(respMerge);
      }
      else {
        ErroAjax(respMerge);
        return false;
      }
    },
    error: function (erro) {
      ErroAjax('error', 'conexao/servidor', 's');
      //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_017)', 's');
    },
  });

  function atualizaBlogs(resposta) {
    // ***** CORRIGE ALTURA e LARGURA DO BANNER *********
    var widthApp = $("#teste1").width();
    var bannerwidth = widthApp - 40; // 10px de cada lado para o card e 10px de cada lado p ID sorteio
    var bannerHeight = (widthApp / 1.7778); // 1980 / 1080 = 1.7778

    var ObjBlog = JSON.parse(JSON.stringify(resposta));
    var img_dir = ObjBlog.diretorio;
    var qtd = ObjBlog.qtd;
    var dados = ObjBlog.dados;
    //var qtd = parseInt(resposta["qtd"]);
    var link_cap = "";
    $.each(dados, function (i, valor) {
      if (i == 0) { link_cap = valor.link };
      $("#blog-" + i).show();
      $('#blog-img-' + i).css('background-image', 'url("' + img_dir + valor.imagem_instituicao + '")');
      //$('#blog-img-' + i).width(bannerwidth + 'px');
      $('#blog-img-' + i).css("width", bannerwidth + 'px');
      //$('#blog-img-' + i).height(bannerHeight + 'px');
      $('#blog-img-' + i).css("height", bannerHeight + 'px');

      $('#blog-inst-' + i).text(valor.nome_instituicao);
      var dataHora = valor.criado_em.split(' ');
      var dataPub = dataHora[0].split('-');

      $('#blog-prefacio-' + i).text(valor.prefacio);
      $('#blog-texto_descritivo-' + i).html(valor.texto_descritivo);

      $('#link-esq-' + i).attr('href', arrumaLinkWeb(valor.link));
      $('#link-dir-' + i).attr('href', arrumaLinkWeb(link_cap));

      if ((valor.prefacio == "") || (valor.prefacio == null)) {
        $('#blog-prefacio-' + i).hide();
        $('#abrir-info-' + i).hide();
        $('#fechar-info-' + i).hide();
        $('#blog-texto_descritivo-' + i).show();
      }
      else {
        $('#abrir-info-' + i).show();
        $('#blog-prefacio-' + i).show();
        $('#fechar-info-' + i).hide();
        $('#blog-texto_descritivo-' + i).hide();
      }
    });

    for (j = qtd; j < 11; j++) {
      $("#blog-" + j).hide();
    }
    app.preloader.hide();
    app.dialog.close()
  };

  $("[name='abrir-texto']").on("click", function () {
    var id = this.id.split('-').pop();
    $('#abrir-info-' + id).hide();
    $('#blog-prefacio-' + id).hide();
    $('#fechar-info-' + id).show();
    $('#blog-texto_descritivo-' + id).show(500);
  });

  $("[name='fechar-texto']").on("click", function () {
    var id = this.id.split('-').pop();
    $('#abrir-info-' + id).show();
    $('#blog-prefacio-' + id).show(500);
    $('#fechar-info-' + id).hide();
    $('#blog-texto_descritivo-' + id).hide();
  });

  function arrumaLinkWeb(linkWeb) {
    if (linkWeb == '') {
      return website;
    }
    else if (linkWeb.substring(0, 12) == 'https://www.') {
      return linkWeb;
    }
    else if (linkWeb.substring(0, 11) == 'http://www.') {
      return linkWeb;
    }
    else if (linkWeb.substring(0, 4) == 'www.') {
      return 'https://'+ linkWeb;
    }
    else {
      return 'https://www.' + linkWeb;
    }
  }
});