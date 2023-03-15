/*
 Transcribe Script - v0.1:
Records the user and returns the transcription on a text question.
 - Why this thing exists?
    We wanted to combine audio input + sentiment analysis 
*/

/*
var qtnId = "QuestionSection_120820657";
const selector = document.createElement("select");
selector.name = "listaDeDispositivos";
selector.id = "listaDeDispositivos";
const paragraph = document.createElement("p");
paragraph.id = "duracion";
const btnGrabar = document.createElement("button");
btnGrabar.id = "btnComenzarGrabacion";
btnGrabar.innerHTML = "Grabar";
const btnDetener = document.createElement("button");
btnDetener.id = "btnDetenerGrabacion";
btnDetener.innerHTML = "Detener y Guardar";
$("#" + qtnId + " span")[0].appendChild(selector);
$("#" + qtnId + " span")[0].appendChild(paragraph);
$("#" + qtnId + " span")[0].appendChild(btnGrabar);
$("#" + qtnId + " span")[0].appendChild(btnDetener);
debugger; */

const tieneSoporteUserMedia = () => !!(navigator.mediaDevices.getUserMedia);

//


if (typeof MediaRecorder === "undefined" || !tieneSoporteUserMedia())
{alert("Navegador no compatible");}

const $listaDeDispositivos = document.querySelector("#listaDeDispositivos"),
            $duracion = document.querySelector("#duracion"),
            $btnComenzarGrabacion = document.querySelector("#btnComenzarGrabacion"),
            $btnDetenerGrabacion = document.querySelector("#btnDetenerGrabacion");


        // Algunas funciones útiles
        const limpiarSelect = () => {
            for (let x = $listaDeDispositivos.options.length - 1; x >= 0; x--) {
                $listaDeDispositivos.options.remove(x);
            }
        }

        const segundosATiempo = numeroDeSegundos => {
            let horas = Math.floor(numeroDeSegundos / 60 / 60);
            numeroDeSegundos -= horas * 60 * 60;
            let minutos = Math.floor(numeroDeSegundos / 60);
            numeroDeSegundos -= minutos * 60;
            numeroDeSegundos = parseInt(numeroDeSegundos);
            if (horas < 10) horas = "0" + horas;
            if (minutos < 10) minutos = "0" + minutos;
            if (numeroDeSegundos < 10) numeroDeSegundos = "0" + numeroDeSegundos;

            return `${horas}:${minutos}:${numeroDeSegundos}`;
        };
        // Variables "globales"
        let tiempoInicio, mediaRecorder, idIntervalo;
        const refrescar = () => {
                $duracion.textContent = segundosATiempo((Date.now() - tiempoInicio) / 1000);
            }
            // Consulta la lista de dispositivos de entrada de audio y llena el select
        const llenarLista = () => {
            navigator
                .mediaDevices
                .enumerateDevices()
                .then(dispositivos => {
                    limpiarSelect();
                    dispositivos.forEach((dispositivo, indice) => {
                        if (dispositivo.kind === "audioinput") {
                            const $opcion = document.createElement("option");
                            // Firefox no trae nada con label, que viva la privacidad
                            // y que muera la compatibilidad
                            $opcion.text = dispositivo.label || `Dispositivo ${indice + 1}`;
                            $opcion.value = dispositivo.deviceId;
                            $listaDeDispositivos.appendChild($opcion);
                        }
                    })
                })
        };
        // Ayudante para la duración; no ayuda en nada pero muestra algo informativo
        const comenzarAContar = () => {
            tiempoInicio = Date.now();
            idIntervalo = setInterval(refrescar, 500);
        };

        // Comienza a grabar el audio con el dispositivo seleccionado
        const comenzarAGrabar = (e) => {
            e.preventDefault();
            if (!$listaDeDispositivos.options.length) return alert("No hay dispositivos");
            // No permitir que se grabe doblemente
            if (mediaRecorder) return alert("Ya se está grabando");

            navigator.mediaDevices.getUserMedia({
                    audio: {
                        deviceId: $listaDeDispositivos.value,
                    }
                })
                .then(
                    stream => {
                        // Comenzar a grabar con el stream
                        mediaRecorder = new MediaRecorder(stream);
                        mediaRecorder.start();
                        debugger;
                        comenzarAContar();
                        // En el arreglo pondremos los datos que traiga el evento dataavailable
                        const fragmentosDeAudio = [];
                        // Escuchar cuando haya datos disponibles
                        mediaRecorder.addEventListener("dataavailable", evento => {
                            // Y agregarlos a los fragmentos
                            fragmentosDeAudio.push(evento.data);
                        });
                        // Cuando se detenga (haciendo click en el botón) se ejecuta esto
                        mediaRecorder.addEventListener("stop", () => {
                            // Detener el stream
                            stream.getTracks().forEach(track => track.stop());
                            // Detener la cuenta regresiva
                            detenerConteo();
                            // Convertir los fragmentos a un objeto binario
                            const blobAudio = new Blob(fragmentosDeAudio);

                            // Crear una URL o enlace para descargar
                            const urlParaDescargar = URL.createObjectURL(blobAudio);
                            // Crear un elemento <a> invisible para descargar el audio
                            let a = document.createElement("a");
                            document.body.appendChild(a);
                            a.style = "display: none";
                            a.href = urlParaDescargar;
                            //a.download = "qp-record.webm";
                            console.log("Archivo generado");
                            // Hacer click en el enlace
                            //a.click();
                            // Y remover el objeto
                            //window.URL.revokeObjectURL(urlParaDescargar);



                            console.log("Transcribiendo");
                            //AWS - Transcribe Stuff
                
                            // Set up the AWS SDK with your credentials and region
                
                            AWS.config.update({
                                accessKeyId: 'AKIAVVWRXJSQ5UHEGRMN',
                                secretAccessKey: '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',
                                region: 'us-east-2',
                            });
                            
                                // Get the file data from the URL
                                console.log(urlParaDescargar);
                                const fileData = urlParaDescargar;
                            
                                // Create a new S3 client
                                const s3 = new AWS.S3();
                                console.log("Client created");
                            
                                // Define the parameters for the S3 upload
                                const params = {
                                Bucket: bucketName,
                                Key: fileName,
                                Body: fileData,
                                };
                            
                                // Upload the file to S3 and log the response
                                s3.upload(params, (err, data) => {
                                if (err) {
                                    console.log(err, err.stack);
                                    console.log("Error uploading file");
                            
                                } else {
                                    console.log(data);
                                    console.log("File Uploaded");
                            
                            
                                    // Create a new Transcribe client
                                    const transcribe = new AWS.TranscribeService();
                            
                                    // Define the parameters for the transcription job
                                    const mediaFileUri = `s3://${bucketName}/${fileName}`;
                                    const outputKey = 'responsespeech.txt';
                                    const params2 = {
                                    TranscriptionJobName: jobName,
                                    LanguageCode: languageCode,
                                    Media: {
                                        MediaFileUri: mediaFileUri,
                                    },
                                    OutputBucketName: outputBucketName,
                                    OutputKey: outputKey,
                                    };
                            
                                    // Submit the transcription job and get the response
                                    transcribe.startTranscriptionJob(params2, (err, data) => {
                                    if (err) {
                                        console.log(err, err.stack);
                                        console.log("Error transcription job");
                                    } else {
                                        console.log(data);
                            
                                        // TODO - Save transcription on a custom and print in a text response.
                                    }
                                    });
                                }
                                });




                        });
                    }
                )
                .catch(error => {
                    // Aquí maneja el error, tal vez no dieron permiso
                    console.log(error)
                });
        };


        const detenerConteo = () => {
            clearInterval(idIntervalo);
            tiempoInicio = null;
            $duracion.textContent = "";
        }

        const detenerGrabacion = (e) => {
            e.preventDefault();
            if (!mediaRecorder) return alert("No se está grabando");
            mediaRecorder.stop();
            mediaRecorder = null;
        }


        $btnComenzarGrabacion.addEventListener("click", comenzarAGrabar);
        $btnDetenerGrabacion.addEventListener("click", detenerGrabacion);


        // Cuando ya hemos configurado lo necesario allá arriba llenamos la lista

        llenarLista();

