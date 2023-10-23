jQuery(function () {
  var ktmp = Date.now();
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
    url: servidor + '/api_public/cidades_atendidas/cidades_atendidas.php',
    beforeSend: function (request) {
      request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("jwt"));
      request.setRequestHeader("chaveapp", chaveAPP);
      request.setRequestHeader("versaoapp", versaoAPP);
    },
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
        atualizaCidades(respMerge.cidadesAtendidas);
      }
      else {
        ErroAjax(respMerge);
      }
    },
    error: function (erro) {
      ErroAjax('error', 'conexao/servidor');
      //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_014)');
    },
  });

  function atualizaCidades(resposta) {
    var code = "";
    var PrimLetra = "";
    $.each(resposta, function (key, dados) {
      if (PrimLetra == dados.nome_cidade.substr(0, 1)) {
        // Recorrente
        code += "    <li>";
        code += "       <div class='item-content'>";
        code += "         <div class='item-inner'>";
        code += "           <div class='item-title'>" + dados.nome_cidade + " / " + dados.estado + "</div>";
        code += "         </div>";
        code += "       </div>";
        code += "     </li>";
      }
      else {
        // Escreve o primeiro índica/Letra da primeira cidade
        PrimLetra = dados.nome_cidade.substr(0, 1);
        // Fecha ul e div anterior
        if (code != "") {
          code += "  </ul>";
          code += "</div>";
        }
        code += "<div class='list-group'>";
        code += "  <ul>";
        code += "    <li class='list-group-title'>" + PrimLetra + "</li>";
        code += "    <li>";
        code += "       <div class='item-content'>";
        code += "         <div class='item-inner'>";
        code += "           <div class='item-title'>" + dados.nome_cidade + " / " + dados.estado + "</div>";
        code += "         </div>";
        code += "       </div>";
        code += "     </li>";
      }

    });
    code += "  </ul>";
    code += "</div>";
    //console.log(code);
    $('.lista-cidades-atendidas').append(code);
  }

});