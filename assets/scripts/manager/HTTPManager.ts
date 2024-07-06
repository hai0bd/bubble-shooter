// // HttpManager.ts

// import DataManager from "./DataManager";

// const { ccclass } = cc._decorator;

// @ccclass
// export default class HttpManager extends cc.Component {

//     static sendHttpPostRequest(name: string, productId: string) {
//         // Dữ liệu bạn muốn gửi đi (nếu có)
//         let http: string = DataManager.instance.http;
//         let packagebuy: string = DataManager.instance.packagebuy;
//         let apiUrl: string = http + packagebuy;

//         const requestData = {
//             clientId: "3ca742915ebae381ce660aee7faa18b41705999217977",
//             productId: productId
//         };

//         // Tạo đối tượng XMLHttpRequest
//         const xhr = new XMLHttpRequest();

//         // Thiết lập phương thức và URL
//         xhr.open("POST", apiUrl, true);

//         // Thiết lập tiêu đề cho yêu cầu (nếu cần thiết)
//         xhr.setRequestHeader("Content-Type", "application/json");
//         xhr.setRequestHeader("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksInJvbGUiOiJFTkRfVVNFUiIsImlhdCI6MTcwNjE1MDIzMCwiZXhwIjo5MDAxNzA2MTUwMjMwfQ.my0jmhQPFZlnLr7dLI4N-JWffj0IEuiJG5bFl--ia6A");

//         // Xử lý sự kiện khi yêu cầu được gửi đi
//         xhr.onreadystatechange = () => {
//             if (xhr.readyState === 4) {
//                 if (xhr.status === 200) {
//                     // Xử lý dữ liệu từ máy chủ ở đây
//                     const responseData = JSON.parse(xhr.responseText);
//                     console.log("Data received:", responseData);
//                     DataManager.instance.msgPortal = responseData.message;
//                 } else {
//                     // Xử lý lỗi nếu có
//                     console.error("Error receiving data. Status code:", xhr.status);
//                 }
//             }
//         };

//         // Chuyển đối tượng dữ liệu thành chuỗi JSON và gửi đi
//         xhr.send(JSON.stringify(requestData));
//     }

//     static sendHttpGetRequest() {
//         let http: string = DataManager.instance.http;
//         let userInfo: string = DataManager.instance.userInfo;
//         let apiUrl = http + userInfo;

//         const xhr = new XMLHttpRequest();
//         xhr.open("GET", apiUrl, true);

//         xhr.setRequestHeader("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksInJvbGUiOiJFTkRfVVNFUiIsImlhdCI6MTcwNjE1MDIzMCwiZXhwIjo5MDAxNzA2MTUwMjMwfQ.my0jmhQPFZlnLr7dLI4N-JWffj0IEuiJG5bFl--ia6A");
//         // cc.loader.load(apiUrl, (err, data) => {
//         //     if (err) {
//         //         console.error("Error loading data:", err);
//         //         return;
//         //     }

//         //     // Xử lý dữ liệu từ máy chủ ở đây
//         //     console.log("Data loaded:", data);
//         // });
//         xhr.onreadystatechange = () => {
//             if (xhr.readyState === 4) {
//                 if (xhr.status === 200) {
//                     // Xử lý dữ liệu từ máy chủ ở đây
//                     const responseData = JSON.parse(xhr.responseText);
//                     console.log("Data received:", responseData);
//                     DataManager.instance.pointPortal = responseData.data.point;
//                     DataManager.instance.msgPortal = responseData.message;

//                 } else {
//                     // Xử lý lỗi nếu có
//                     console.error("Error receiving data. Status code:", xhr.status);
//                 }
//             }
//         };
//         xhr.send();

//     }
// }
