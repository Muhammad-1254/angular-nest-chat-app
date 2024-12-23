export const baseUrl = "http://localhost:3000";

export const apiPath={
  register:baseUrl+"/auth/register",
  login:baseUrl+"/auth/login",
  getAccessToken:baseUrl+"/auth/getAccessToken",




  postSavedUserSync:baseUrl+"/sync/savedUser",
  getSavedUserSync:baseUrl+"/sync/savedUser",
getSyncAll:baseUrl+"/sync/all",




  getCurrentUser:baseUrl+"/user/current",
  getPresignedUrl:baseUrl+"/cloudinary/presigned-url",
  uploadMediaMessage:baseUrl+"/cloudinary/media/message",


}
