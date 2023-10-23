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
    url: servidor + '/api_public/institucional/como_funciona.php',
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
        var novoTextoHTML = dimensaoIframeVideo(respMerge.dadosHtml);
        $("#como-funciona-text-html").append(novoTextoHTML);
      }
      else {
        ErroAjax(respMerge);
        return false;
      }
    },
    error: function (erro) {
      ErroAjax('error', 'conexao/servidor');
      //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_031)','s');
    },
  });

});