// CallBack

const loginUser = (email, password, onSucess, onError) => {
  setTimeout(() => {
    const isError = false;
    if(isError) {
        return onError(new Error("User not found"));
    } else {
        return onSucess({ email});
    }
  }, 3000);
};

const getUserVideos = (email, onSucessVideo) => {
    setTimeout(() => {
        const videos = ["video1", "video2", "video3"];
        return onSucessVideo(videos);
    }, 2000);
}
const getVideoDetails = (video, onSucessDetails) => {
    setTimeout(() => {
        onSucessDetails({title: "video title"});
    }, 1000);
}

const onSucess = (user) => {
    console.log('usuario logado',user.email);
    getUserVideos(user.email, (videos) => {
        console.log('videos do usuario',videos);
        getVideoDetails(videos[0], (details) => {
            console.log('detalhes do video',details);
        })
    })
}

const onError = (error) => {
    console.log(error);
}

const user = loginUser("berg", "123456", onSucess, onError);



