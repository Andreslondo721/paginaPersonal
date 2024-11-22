function ipBinaria(ip) {
    return ip.split('.').map(part => {
        return ('00000000' + (parseInt(part, 10)).toString(2)).slice(-8);
    }).join('.');
}

function calcularIpRed(ip, mascara) {
    const partesIp = ip.split('.').map(Number);
    const partesMascara = mascara.split('.').map(Number);
    const parteRed = partesIp.map((part, index) => part & partesMascara[index]);
    return parteRed.join('.');
}

function calcularIpBroadcast(ip, mascara) {
    const ipRed = calcularIpRed(ip, mascara);
    const parteRed = ipRed.split('.').map(Number);
    const partesMascara = mascara.split('.').map(Number);
    const partesBroadcast = parteRed.map((part, index) => part | (~partesMascara[index] & 255));
    return partesBroadcast.join('.');
}

function calcularHosts(mascara) {
    const partesMascara = mascara.split('.').map(part => parseInt(part, 10));
    const bitsMascara = partesMascara.map(part => (part).toString(2).padStart(8, '0')).join('');
    const bitsHost = 32 - bitsMascara.split('1').pop().length;
    return Math.pow(2, bitsHost) - 2;
}

function calcularClaseIp(ip) {
    const primerOcteto = parseInt(ip.split('.')[0], 10);
    if (primerOcteto <= 127) return "Clase A";
    if (primerOcteto <= 191) return "Clase B";
    if (primerOcteto <= 223) return "Clase C";
    if (primerOcteto <= 239) return "Clase D";
    return "Clase E";
}

function calcularTipoIp(ip) {
    const partes = ip.split('.');
    return (partes[0] === '10') ||
           (partes[0] === '172' && partes[1] >= 16 && partes[1] <= 31) ||
           (partes[0] === '192' && partes[1] === '168');
}

function coloresIp(ip, mascara) {
    const ipBinario = ipBinaria(ip).split('.').join('');
    const mascaraBinario = ipBinaria(mascara).split('.').join('');

    let bitRed = mascaraBinario.split('1').length - 1; // Bits de red (1s en la máscara)
    let bitSubred = 0; // Ajusta si es necesario (bits de subred)
    let bitsHost = 32 - bitRed - bitSubred; // Bits de host

    const coloresBinario = `
        <span class="red">${ipBinario.slice(0, bitRed)}</span>
        <span class="subred">${ipBinario.slice(bitRed, bitRed + bitSubred)}</span>
        <span class="host">${ipBinario.slice(bitRed + bitSubred)}</span>
    `;
    return coloresBinario;
}

document.getElementById('formulario').addEventListener('submit', function(event) {
    event.preventDefault();

    const ip = document.getElementById('ip').value;
    let mascara = document.getElementById('mascara').value;

    // Convertir CIDR a máscara si es necesario
    if (mascara.includes('/')) {
        const cidr = parseInt(mascara.split('/')[1], 10);
        mascara = ((1 << cidr) - 1 << (32 - cidr)).toString(2).match(/.{1,8}/g).map(byte => parseInt(byte, 2)).join('.');
    }

    const ipRed = calcularIpRed(ip, mascara);
    const broadcastIp = calcularIpBroadcast(ip, mascara);
    const hosts = calcularHosts(mascara);
    const claseIp = calcularClaseIp(ip);
    const tipoIp = calcularTipoIp(ip) ? "Privada" : "Pública";

    const binarioRed = coloresIp(ipRed, mascara);
    const binarioBroadcast = coloresIp(broadcastIp, mascara);

    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = `
        <h2>Resultados</h2>
        <p>IP de red: ${ipRed}</p>
        <p>IP de broadcast: ${broadcastIp}</p>
        <p>Cantidad de IP útiles: ${hosts}</p>
        <p>Rango de IP útiles: ${parseInt(ipRed.split('.')[3]) + 1}-${parseInt(broadcastIp.split('.')[3]) - 1}</p>
        <p>Clase de IP: ${claseIp}</p>
        <p>IP: ${tipoIp}</p>
        <p>Porción de red en binario: ${binarioRed}</p>
        <p>Porción de hosts en binario: ${binarioBroadcast}</p>
    `;
});
