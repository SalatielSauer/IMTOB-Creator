document.getElementById("pitchvalue").value = 0
const imageLoader = document.getElementById('fileinput');
imageLoader.addEventListener('change', importImg, false);
const uploadlbl = document.getElementById("uploadlbl");
const downloadbtn = document.getElementById("downloadbtn");
const imagepreview = document.getElementById("imagepreview");
const imagepreviewctx = imagepreview.getContext('2d');
imagepreviewctx.drawImage(document.getElementsByTagName("img").item("src"), 0, 0);
const imageinputsizew = document.getElementById("imgsizew");
const imageinputsizeh = document.getElementById("imgsizeh");
const checkboxes = document.getElementById("checkboxes");

checkboxlist = ["objcullface *", "mdlcollide", "objfullbright *"]
for (c = 0; c < checkboxlist.length; c++) { 
	checkboxes.innerHTML += '<label class="checkboxlbls" onclick="checkbstate(' + c + ')"><input style="pointer-events: none" type="checkbox" name="' + checkboxlist[c] + '">' + checkboxlist[c].replace(/obj/g, "").replace(/mdl/g, "").replace(/\*/g, "") + '</input></label>'
}
function checkbstate(id, state) {
	const nitem = document.getElementsByTagName("input").namedItem(checkboxlist[id]);
	if (state == 1) {
		return ~~nitem.checked;
	} else {
		if (nitem.checked == true) {nitem.checked = false} else {nitem.checked = true};
	}
}

function togglehelp() {
	const helpui = document.getElementById("infos");
	if (helpui.style.display == "none") {helpui.style.display = "unset";} else {helpui.style.display = "none";}
}

function updatepitchpreview(value) {
	const ival = document.getElementById("iconpitch");
	ival.style.transform = "rotate(" + value + "deg)";
	itext = document.getElementById("iconpitchtext");
	itext.innerText = "(" + value + ")";
}

var img = new Image();
var userfile;
function importImg(e){
    var reader = new FileReader();
	userfile = e.target.files[0];
	if (userfile){
		reader.onload = function(event){
			img.onload = function(){
				imagepreview.width = img.width;
				imagepreview.height = img.height;
				imageinputsizew.value = img.width;
				imageinputsizeh.value = img.height;
				imagepreviewctx.drawImage(img, 0, 0);
				downloadbtn.style.pointerEvents = "unset";
				downloadbtn.style = imageLoader.style;
				uploadlbl.style.fontSize = "15px";
				uploadlbl.style.backgroundColor = "#222633";
			}
			img.src = event.target.result;
		}
		reader.readAsDataURL(e.target.files[0]);
	}
}

function keepaspect(type) {
	if (!userfile) {return};
	w = imageinputsizew;
	h = imageinputsizeh;
	if (w.value.match(/[^$,.\d]/) || h.value.match(/[^$,.\d]/)) {w.value = img.width; h.value = img.height; return};
	if (type == 0) {
		h.value = w.value*img.height/img.width;
		h.value = Number(parseInt(h.value).toPrecision(4));
	} else {
		w.value = h.value*img.width/img.height;
		w.value = Number(parseInt(w.value).toPrecision(4));
	}
}

var objoutput, cfgoutput, filename;
function genobj(userfile, w, h) {
	filename = userfile.name.replace(/\s/g, "_").substr(0, userfile.name.lastIndexOf("."));
	objoutput = "# Generated with IMTOB, a decal maker for Sauerbraten\n# salatielsauer.github.io/IMTOB-Creator\n# By @SalatielSauer\no " + filename;
	objoutput += "\nv -" + w.value + " -" + h.value + " -0";
	objoutput += "\nv " + w.value + " -" + h.value + " -0";
	objoutput += "\nv -" + w.value + " " + h.value + " 0";
	objoutput += "\nv " + w.value + " " + h.value + " 0";
	objoutput += "\nvt 0 0\nvt 1 0\nvt 1 1\nvt 0 1"
	objoutput += "\ns off\nf 1/1 2/2 4/3 3/4\n";
}

function downloadzip() {
	zip = new JSZip();

	//writing OBJ
	genobj(userfile, imageinputsizew, imageinputsizeh);

	//writing CFG
	cfgoutput = "objload \"model.obj\"\nobjskin * \"skin.png\"\nmdlscale 5";
	cfgoutput += "\nmdlpitch " + document.getElementById("pitchvalue").value + "\nobjalphatest * 0\n";
	for (c = 0; c < checkboxlist.length; c++) {cfgoutput += checkboxlist[c] + " " + checkbstate(c, 1) + "\n";};
	
	//saving ZIP
	//skin
	zip.file("packages/models/" + filename + "/skin.png", imagepreview.toDataURL('image/png', [0.0, 1.0]).split(',')[1], {base64: true});
	//obj
	zip.file("packages/models/" + filename + "/model.obj", objoutput)
	//cfg
	zip.file("packages/models/" + filename + "/obj.cfg", cfgoutput)
	zip.generateAsync({type:"blob"})
	.then(function (blob) {
	    saveAs(blob, filename + "_decal.zip");
	});
}
