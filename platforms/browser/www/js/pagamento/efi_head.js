var server = ((EFI_Sandbox) ? "https://sandbox.gerencianet.com.br" : "https://api.gerencianet.com.br");
var s = document.createElement('script');
s.type = 'text/javascript';
var v = parseInt(Math.random() * 1000000);
s.src = server + '/v1/cdn/' + EFI_PayeeCode + '/' + v;
s.async = false;
s.id = EFI_PayeeCode;
if (!document.getElementById(EFI_PayeeCode)) {
  document.getElementsByTagName('head')[0].appendChild(s);
};
$gn = {
  validForm: true,
  processed: false,
  done: {},
  ready: function (fn) {
    $gn.done = fn;
  }
}
/**ADICIONAR BOTAO DE ACIONAMENTO */
let btn = document.createElement("button");
btn.innerHTML = "";
btn.id = "btnGnToken";
btn.style.display="none"
document.getElementById("app").appendChild(btn);
