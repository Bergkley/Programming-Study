// Async + Await

const loginUser = (email, password) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const isError = false;

      if (isError) {
        reject(new Error("User not found"));
      } else {
        resolve({ email: "berg" });
      }
    }, 3000);
  });

const getUserVideos = (email) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(["video1", "video2", "video3"]);
    }, 2000);
  });
};

const getVideoDetails = (video) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ title: "video title" });
    }, 1000);
  });
};

const displayUser = async () => {
  try {
    const user = await loginUser("berg", "123456");
    console.log("Usuário logado:", user.email);

    const videos = await getUserVideos(user.email);
    console.log("Vídeos do usuário:", videos);

    const details = await getVideoDetails(videos[0]);
    console.log("Detalhes do vídeo:", details);
  } catch (error) {
    console.error(error);
  }
};

displayUser();

const fetchApi = async () => {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/todos/1"
    );

    const data = await response.json();

    console.log(data);
  } catch (error) {
    console.error(error);
  }
};

fetchApi();
