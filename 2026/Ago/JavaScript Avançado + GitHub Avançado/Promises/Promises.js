// Promises

const loginUser = (email, password) => new Promise((resolve, reject) => {
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
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(["video1", "video2", "video3"]);
    }, 2000);
  });
};

const getVideoDetails = (video) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ title: "video title" });
    }, 1000);
  });
};

loginUser("berg", "123456")
  .then((user) => {
    console.log("usuario logado", user.email);
    return getUserVideos(user.email);
  })
  .then((videos) => {
    console.log("videos do usuario", videos);
    return getVideoDetails(videos[0]);
  })
  .then((details) => {
    console.log("detalhes do video", details);
  })
  .catch((error) => {
    console.log(error);
  })

// Promisse all: 

const yt = new Promise (resolve => {
    setTimeout(() => {
        resolve("video do youtube");
    }, 8000);
});

const fb = new Promise (resolve => {
    setTimeout(() => {
        resolve("post do facebook");
    }, 8000);
});


Promise.all([yt, fb]).then(result => console.log(result));

// Promisse race:

const yt2 = new Promise (resolve => {
    setTimeout(() => {
        resolve("video do youtube com race");
    }, 8000);
});

const fb2 = new Promise (resolve => {
    setTimeout(() => {
        resolve("post do facebook com race");
    }, 8000);
});


Promise.race([yt2, fb2]).then(result => console.log(result));

// Promisse allSettled:

const yt3 = new Promise (resolve => {
    setTimeout(() => {
        resolve("video do youtube com allSettled");
    }, 8000);
});

const fb3 = new Promise (resolve => {
    setTimeout(() => {
        resolve("post do facebook com allSettled");
    }, 8000);
});


Promise.allSettled([yt3, fb3]).then(result => console.log(result));

// Promisse any:

const yt4 = new Promise (resolve => {
    setTimeout(() => {
        resolve("video do youtube com any");
    }, 8000);
});

const fb4 = new Promise (resolve => {
    setTimeout(() => {
        resolve("post do facebook com any");
    }, 8000);
});


Promise.any([yt4, fb4]).then(result => console.log(result));


