jQuery(function () {


  var vt = app.views.main.router.currentRoute.params.vt;
  if (vt == 'S') {
    $('#p_validarTelefone').show();
    $('#validarTelefone').show();
    $('#p_cadcadastraP1').hide();
    $('#CadcadastraP1').hide();
    $("#CadcadastraP1").attr("readonly", true);
    $("#CadcadastraP1").attr('disabled', 'disabled'); // desabilita o botao
  }
  else {
    $('#CadcadastraP1').show();
    $('#p_cadcadastraP1').show();
    $("#validarTelefone").attr("readonly", true);
    $("#validarTelefone").attr('disabled', 'disabled'); // desabilita o botao
    $('#validarTelefone').hide();
    $('#p_validarTelefone').hide();
  }
  // Máscara/Formata os campos 
  $('#CadtelefoneCadastro').mask('(00) 00000-0009');
  $('#CadCPFCadastro').mask('000.000.000-00');

  var novoTelSuporte = 'https://wa.me/' + localStorage.getItem("telSuporte") + '/?text=Ol%c3%a1%21%20Estou%20com%20dificuldades%20para%20efetuar%20cadastro%20na%20tela%20P0.%20Poderia%20me%20ajudar%3f';
  $("#cadastro_suporteP0").attr("href", novoTelSuporte);

  // Dados enviados pela pesquisa CPF
  if (localStorage.getItem("postDados")) {
    // Cadastro com informações do POSTDADOS recebidas da CPFCNPJ
    var postDados = JSON.parse(localStorage.getItem("postDados"));

    if ((postDados.name != "") && (postDados.name != null)) {
      var cpf_formatado = postDados.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      var formData = {
        'nomeCadastro': postDados.name,
        'dataNascimento': dataParaTexto(postDados.data_nascimento, "dd-mm-aaaa"),
        'dataNascimentoData': dataParaTexto(postDados.data_nascimento, "dd-mm-aaaa"),
        'dataNascimentoText': dataParaTexto(postDados.data_nascimento, "dd-mm-aaaa"),
        'cpf': cpf_formatado
      }
      app.form.fillFromData('#cadastrop1', formData);
      $('#CadnomeCadastro').prop('readonly', true);
      $("#CadnomeCadastro").attr('disabled', 'disabled');
      $('#CaddatanascimentoCadastroTexto').prop('readonly', true);
      $("#CaddatanascimentoCadastroTexto").attr('disabled', 'disabled');
      $('#dataNascimentoData').prop('readonly', true);
      $("#dataNascimentoData").attr('disabled', 'disabled');
      $('#CadCPFCadastro').prop('readonly', true);
      $("#CadCPFCadastro").attr('disabled', 'disabled');
    }
  }
  else {
    var postDados = null;
    if ((localStorage.getItem("cadM") == "S")) {
      $('#CaddatanascimentoCadastroData').show();
      $('#CaddatanascimentoCadastroTexto').hide();
      // Cadastro Manual
      $('#CadCPFCadastro').val(formataCPF(localStorage.getItem("cpf")));
      $('#CadCPFCadastro').mask('000.000.000-00');
      $('#CadCPFCadastro').prop('readonly', true);
      $("#CadCPFCadastro").attr('disabled', 'disabled');

    }
  }

  //GERAR O PICKER
  var today = new Date();
  pickerCustomToolbar = app.picker.create({
    //cssClass: 'teste',
    inputEl: '#CaddatanascimentoCadastroData',
    rotateEffect: true,
    sheetSwipeToClose: false,
    closeByOutsideClick: false,
    backdrop: true,
    //toolbarCloseText: 'OK',
    renderToolbar: function () {
      return '<div class="toolbar picker_toolbar">' +
        '<div class="toolbar-inner picker_toolbar">' +
        '<div class="left">' +
        '<a href="#" class="link cab_picker">Selecione a data</a>' +
        '</div>' +
        '<div class="right">' +
        '<a href="#" class="link cab_picker sheet-close popover-close picker_botao">OK</a>' +
        '</div>' +
        '</div>' +
        '</div>';
    },
    value: [
      1,//today.getDate(),
      1,//today.getMonth() + 1,
      today.getFullYear() - 16,
    ],
    formatValue: function (values, displayValues) {
      if (values[1] < 10) { var mes = '0' + values[1]; } else { var mes = values[1]; }
      if (values[0] < 10) { var dia = '0' + values[0]; } else { var dia = values[0]; }
      //return values[0] + '/' + mes + '/' + values[2];
      return values[2] + '-' + mes + '-' + dia;
    },
    cols: [
      // Days
      {
        values: [01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
      },
      // Months
      {
        values: ('1 2 3 4 5 6 7 8 9 10 11 12').split(' '),
        displayValues: ('Janeiro Fevereiro Março Abril Maio Junho Julho Agosto Setembro Outubro Novembro Dezembro').split(' '),
        textAlign: 'left'
      },
      // Years
      {
        values: (function () {
          var arr = [];
          for (var i = 1901; i <= today.getFullYear() - 16; i++) { arr.push(i); }
          return arr;
        })(),
      },
      // Space divider
      {
        divider: true,
        content: '&nbsp;&nbsp;'
      },
    ],
    on: {
      change: function (picker, values, displayValues) {
        var daysInMonth = new Date(picker.value[2], picker.value[1] * 1, 0).getDate();
        if (values[0] > daysInMonth) {
          picker.cols[0].setValue(daysInMonth);
        }
      },
    }
  });


  //PICKER DE CALENDÁRIO
  $('#CaddatanascimentoCadastroData').on('click', function () {
    if ((localStorage.getItem("cadM") == "S")) {
      pickerCustomToolbar.open();
    }
  });
  // $('#validarTelefone').click(function () {});
  $('#CadcadastraP1').on("click", function () {
    if (vt == 'N') {
      app.dialog.preloader('Aguarde...');
      var dadosCadastrais = validarDadosCadastrais();
      if (dadosCadastrais) {
        if (dadosCadastrais.statusValidacao) {
          if (dadosCadastrais.statusValidacao == 'ok') {
            cadastrar(dadosCadastrais);
          }
        }
      }
    }
  });

  //$('#CadcadastraP1').click(function () {});
  $('#CadsenhaCadastro').on("focusout", function () {
    var senha = $(this).val();
    if (!verificaSenhaSegura(senha)) { ToastSenha(); }
  });

  // $("#CadtelefoneCadastro").keyup(function () { if ($(this).val().length == 15) { }});
  $('#validarTelefone').on("click", function () {
    desabilitaBotao("validarTelefone");
    var dadosCadastrais = validarDadosCadastrais();
    if (dadosCadastrais) {
      if (dadosCadastrais.statusValidacao) {
        if (dadosCadastrais.statusValidacao == 'ok') {
          gerarCodValidacaoTelefone(dadosCadastrais);
        }
      }
    }
    else {
      habilitaBotao("validarTelefone");
    }
  });

  function desabilitaBotao(id) {
    app.dialog.preloader('Aguarde...');
    $('#' + id).attr('disabled', 'disabled');
    $('#' + id).removeClass('pulse_infinite');
  }

  function habilitaBotao(id) {
    $('#' + id).removeAttr('disabled');
    $('#' + id).addClass('pulse_infinite');
    app.preloader.hide();
  }

  function validarDadosCadastrais() {
    var msg_erro = '';
    // Recebe o valor das variáveis
    // Para n correr o risco da pessoa editar o formulário, pega os valores originais da variavel postDados
    if ((postDados == null) || (postDados.name == '') || (postDados.name == 'null') || (postDados.name == null)) {
      var nome = $('#CadnomeCadastro').val();
    }
    else {
      var nome = postDados.name;
    }

    if ((localStorage.getItem("cadM") == "S")) {
      // Se o cadastro manuel, coloca a primeira leta de cada nome em maiustulo
      nome = converterPrimeirasLetrasMaiusculas(nome);
    }
    var validaNome = validaNomeCadastro(nome);
    if (validaNome != "ok") {
      msg_erro = msg_erro != '' ? msg_erro : validaNome;
    }

    if ((postDados == null) || (postDados.cpf == '') || (postDados.cpf == 'null') || (postDados.cpf == null)) {
      var cpf = $("#CadCPFCadastro").val();
    }
    else {
      var cpf = postDados.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    if ((postDados == null) || (postDados.data_nascimento == '') || (postDados.data_nascimento == 'null') || (postDados.data_nascimento == null)) {
      if ((localStorage.getItem("cadM") == "S")) {
        var dataNascimento = dataParaTexto($("#CaddatanascimentoCadastroData").val(), "aaaa-mm-dd");
        var valDataNascimento = validaDataNascimento(dataNascimento);
      }
      else {
        var dataNascimento = dataParaTexto($("#CaddatanascimentoCadastroTexto").val(), "aaaa-mm-dd");
        var valDataNascimento = validaDataNascimento(dataNascimento);
      }
    }
    else {
      var dataNascimento = dataParaTexto(postDados.data_nascimento, "aaaa-mm-dd");
      var valDataNascimento = validaDataNascimento(dataNascimento);
    }
    if (dataNascimento == 'undefined-undefined-undefined') {
      valDataNascimento = false;
    }

    var user_email = $("#CademailCadastro").val();
    var user_email = user_email.trim();
    var telefone = $("#CadtelefoneCadastro").val();

    var sexogenero = $("#sexogenero").val();


    user_email = user_email.toLowerCase();
    user_email = user_email.replace(/\ /g, '');
    user_email = user_email.replace(".@", '@');
    document.getElementById("CademailCadastro").value = user_email;

    if (telefone == '') {
      msg_erro = msg_erro != '' ? msg_erro : 'Por favor, informe o número do seu celular.';
    }
    else if (telefone.length < 15) {
      msg_erro = msg_erro != '' ? msg_erro : 'Por favor, informe um telefone correto.';
    }
    else if (!validaPhone(telefone)) {
      msg_erro = msg_erro != '' ? msg_erro : 'Por favor, informe um telefone correto.';
    }

    if (sexogenero == '') {
      msg_erro = msg_erro != '' ? msg_erro : 'Atenção, preencha os campos obrigatórios !';
    }

    // Valida data de Nascimento
    if (valDataNascimento == false) {
      msg_erro = msg_erro != '' ? msg_erro : 'Por favor, preencha a data de nascimento corretamente.';
    }
    //Valida se algum campo não foi preenchido
    if ((nome == '') || (cpf == '') || (dataNascimento == '') || (telefone == '')) {
      msg_erro = msg_erro != '' ? msg_erro : 'Por favor, todos os campos são obrigatórios.';
    }
    if ((nome !== '') && (cpf !== '') && (dataNascimento !== '') && (telefone !== '')) {
      if (!validaCpfCnpj(cpf)) { // envio do CNPJ com a mascara
        msg_erro = msg_erro != '' ? msg_erro : 'Favor informar um CPF válido.';
      }
      //  Valida email
      if (!validaEmail(user_email)) {
        msg_erro = msg_erro != '' ? msg_erro : 'Favor informar um email válido.';
      }
      //VALIDACAO DO EMAIL
      var sEmail = user_email;
      // filtros
      var emailFilter = /^.+@.+\..{2,}$/;
      var illegalChars = /[\(\)\<\>\,\;\:\\\/\"\[\]]/
      // condicao
      if (!(emailFilter.test(sEmail)) || sEmail.match(illegalChars)) {
        //EMAIL INVALIDO
        msg_erro = msg_erro != '' ? msg_erro : 'Por favor, informe um e-mail válido!';
      }
    }
    if (msg_erro != '') {
      app.dialog.close();
      app.preloader.hide();
      ErroValidacao(msg_erro);
      var retorno = false;
    }
    else {
      retorno = {
        nome: nome,
        user_login: cpf,
        cpf: cpf,
        user_email: user_email,
        datanascimento: dataNascimento,
        telefone: telefone,
        lang: 'pt-br',
        cadastro: '1',
        sexogenero: sexogenero,
        statusValidacao: 'ok'
      };
    }
    return retorno;
  };

  function abrirMsgValidacaoTelefone(dadosCadastrais) {
    app.dialog.close();
    app.preloader.hide();
    var Dialog_text = dadosCadastrais.nome.split(' ')[0] + ", informe o código recebido por Whatsapp ou mensagem SMS";
    var Dialog_title = null;
    var ID_Aleatorio = 'codigoRecebido_' + Math.floor(Math.random() * 9999);
    var dialog = app.dialog.create({
      title: '<div style="font-size: 0.9em;text-align:center">' + dadosCadastrais.telefone + '</div>',
      text: '<div style="font-size: 0.9em;text-align:center">' + Dialog_text + '</div>',
      //content: '<div class="dialog-input-field item-input"><div class="item-input-wrap"><input class="dialog-input" style="text-align: center;" id="codigoRecebido" type="tel" placeholder="Informe o código aqui" required validate pattern="[0-9]*" data-error-message="Apenas números!"></div></div>',
      content: '<div class="dialog-input-field item-input"><div class="item-input-wrap"><input class="dialog-input" style="text-align: center;" id="' + ID_Aleatorio + '" type="tel" placeholder="Informe o código aqui"></div></div>',
      closeByBackdropClick: false, backdrop: true,
      buttons: [
        {
          text: 'CANCELAR',
          cssClass: 'dialog_button_esquerda-cancelar dialog-button-50',
          onClick: function (dialog, index) {
            habilitaBotao("validarTelefone");
            return false;
          },
        },
        {
          text: 'CONFIRMAR',
          cssClass: 'dialog_ok_Button dialog_button_direita dialog-button-50',
          onClick: function (dialog, index) {
            //var codInformado = dialog.$el.find('.dialog-input').val();
            var codInformado = dialog.$el.find('#' + ID_Aleatorio).val();
            verificarCodValidacaoTelefone(codInformado, dadosCadastrais)
          },
        },
      ],
      onClick: function (dialog, index) {
        //console.log(dialog.$el.find('.dialog-input').val());
      },
      on: {
        open: function () {
          //$('#codigoRecebido').mask('0-0-0-0-0');
          $('#' + ID_Aleatorio).mask('0-0-0-0-0');
        },
        opened: function () { }
      }
    }).open();

  }

  function gerarCodValidacaoTelefone(dadosCadastrais) {
    var ktmp = Date.now();
    var dataC = {
      cpf: dadosCadastrais.cpf,
      telefone: dadosCadastrais.telefone,
      acao: 'gerarCodigo'
    };
    var dataD = {
      ktmp: ktmp,
      device: localStorage.getItem("device"),
    };
    var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
    var dataD = JSON.stringify(dataD);
    app.request({
      url: servidor + '/api_public/cadastro/autenticar_telefone.php',
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "Bearer " + "novo_cadastro");
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
        app.preloader.hide();
        app.dialog.close();
        var resp = descriptDadosRecebido(resposta, ktmp);
        var respMerge = { ...resp.d, ...resp.c, ...resp.a };
        //console.log(respMerge);
        if (respMerge.status == 'ok') {
          app.dialog.close();
          app.preloader.hide();
          abrirMsgValidacaoTelefone(dadosCadastrais);
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

  function verificarCodValidacaoTelefone(codInformado, dadosCadastrais) {
    var ktmp = Date.now();
    var dataC = {
      cpf: dadosCadastrais.cpf,
      telefone: dadosCadastrais.telefone,
      acao: 'validarCodigo',
      cod: codInformado
    };
    var dataD = {
      ktmp: ktmp,
      device: localStorage.getItem("device"),
    };
    var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
    var dataD = JSON.stringify(dataD);
    app.request({
      url: servidor + '/api_public/cadastro/autenticar_telefone.php',
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "Bearer " + "novo_cadastro");
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
        app.preloader.hide();
        app.dialog.close();
        var resp = descriptDadosRecebido(resposta, ktmp);
        var respMerge = { ...resp.d, ...resp.c, ...resp.a };
        if (respMerge.status == 'ok') {
          cadastrar(dadosCadastrais);
        }
        else {
          habilitaBotao("validarTelefone");
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

  function cadastrar(dadosCadastrais) {
    //AJAX PARA CADASTRAR
    var ktmp = Date.now();
    //app.dialog.preloader('Cadastrando...');
    var dataC = {
      nome: dadosCadastrais.nome,
      user_login: dadosCadastrais.cpf,
      cpf: dadosCadastrais.cpf,
      user_email: dadosCadastrais.user_email,
      datanascimento: dadosCadastrais.datanascimento,
      telefone: dadosCadastrais.telefone,
      lang: dadosCadastrais.lang,
      cadastro: dadosCadastrais.cadastro,
      sexogenero: dadosCadastrais.sexogenero
    };
    var dataD = {
      ktmp: ktmp,
      device: localStorage.getItem("device"),
    };
    var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
    var dataD = JSON.stringify(dataD);
    app.request({
      url: servidor + '/api_public/cadastro/cadastrar.php',
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "Bearer " + "novo_cadastro");
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
        app.preloader.hide();
        app.dialog.close();
        var resp = descriptDadosRecebido(resposta, ktmp);
        var respMerge = { ...resp.d, ...resp.c, ...resp.a };
        if (respMerge.status == 'ok') {
          localStorage.setItem("nome", dadosCadastrais.nome);
          localStorage.setItem("cpf", dadosCadastrais.cpf);
          localStorage.setItem("user_email", dadosCadastrais.user_email);
          localStorage.setItem("datanascimento", dadosCadastrais.datanascimento);
          localStorage.setItem("telefone", dadosCadastrais.telefone);
          app.views.main.router.navigate('/cadastro_p2/');
        }
        else {
          //ErroAjax('error', 'Desculpe, tente novamente mais tarde!', 's');
          return false;
        }
      },
      error: function (erro) {
        ErroAjax('error', 'conexao/servidor');
      },
      complete: function () { }
    });
  }

});