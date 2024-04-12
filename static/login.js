const csrftoken = document
  .querySelector('meta[name="csrf-token"]')
  .getAttribute("content");

const video = document.getElementById("video-element");
const image = document.getElementById("img-element");
const captureBtn = document.getElementById("capture-btn");
const reloadBtn = document.getElementById("reload-btn");

//dodajemo event na reload jer nismo sigurni da cemo uvek dobiti success kod take
reloadBtn.addEventListener("click", () => {
  window.location.reload();
});
if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      const { height, width } = stream.getTracks()[0].getSettings();
      captureBtn.addEventListener("click", (e) => {
        captureBtn.classList.add("not-visible");
        const track = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(track);

        imageCapture.takePhoto().then((blob) => {
          const img = new Image(width, height);
          img.src = URL.createObjectURL(blob);
          image.append(img);
          video.classList.add("not-visible");

          const reader = new FileReader();

          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64Data = reader.result;

            const fd = new FormData();
            fd.append("csrfmiddlewaretoken", csrftoken);
            fd.append("photo", base64Data);
            $.ajax({
              type: "POST",
              url: "/find/",
              enctype: "multipart/form-data",
              data: fd,
              processData: false,
              contentType: false,
              beforeSend: function (xhr) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
              },
              success: (resp) => {
                window.location.href = window.location.origin;
              },
              error: (err) => {
                window.alert("Unknown user!");
              },
            });
          };
        });
      });
    })
    .catch((error) => {
      console.error("Error accessing the camera: ", error);
    });
}
