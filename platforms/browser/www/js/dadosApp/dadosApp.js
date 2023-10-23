// Função para escrever os dados personalizados contido no arquivo dadosApp.json
function escreveDadosApp(page) {
  // Atualiza os Parágrafos
  //eda-escreveDadosAplicativo
  var var_valorItem = "";
  var var_Item = "";

  $("[eda-html], [eda-text], [eda-href], [eda-src], [eda-showHide]").each(function () {
    var nomeItem = ""; // tipo [eda-html], [eda-text], [eda-href], [eda-src], [eda-showHide]
    $.each(this.attributes, function (i, a) {
      //console.log(i, a.name, a.value);
      if (a.name.substring(0, 4) == "eda-") {
        nomeItem = a.name
      }
    });

    var item = $(this).attr(nomeItem);
    item = item.split('.');
    var_Item = textoDadoAppJS;
    for (let i = 0; i < item.length; i++) {
      if (var_Item[item[i]]) {
        var_Item = var_Item[item[i]];
      }
      else {
        var_Item = "";
      }
    }

    // Caso seja IP internacional, retira o nome COMPRAR e mantém HOME
    if (($(this).attr("eda-text") == 'rodape.rodape1') && (locUsu == 'nok')) {
      $(this).text('HOME');
    }
    else if (var_Item == "ocultar") {
      $(this).hide();
    }
    else if (var_Item == "mostrar") {
      $(this).show();
    }
    else if (var_Item != "padrao") {
      valorFinal = var_Item
      if (nomeItem == "eda-html") {
        $(this).html(valorFinal);
        //console.log('op1', 'eda-html');
      } else if (nomeItem == "eda-text") {
        $(this).text(valorFinal);
        //console.log('op2', 'eda-text');
      } else if (nomeItem == "eda-href") {
        $(this).attr("href", valorFinal);
        //console.log('op3', 'eda-href');
      } else if (nomeItem == "eda-src") {
        $(this).attr("src", valorFinal);
        //console.log('op3', 'eda-src');
      }
    }
  });
};


// 1- Atualiza dados LOCAL para variavel textoDadoAppJS
function getDadoAppJS(item) {
  fetch(item)
    .then((response) => response.json())
    .then((json) => armazenaGetDadoAppJS(json));
}
// 2- Atualiza dados para variavel textoDadoAppJS
function armazenaGetDadoAppJS(json) {
  textoDadoAppJS = json;
}



