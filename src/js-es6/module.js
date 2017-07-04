function say(text) {
	console.log(`We said ${text}`);
}

export default say;

function laugh() {
	console.log('Ha-ha-ha');
}

function show(text) {
	document.getElementById('screen').innerHTML = text;
}

export {laugh,show};