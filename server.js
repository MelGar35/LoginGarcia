import express, { json } from "express"
import cookieParser from "cookie-parser"
import session from "express-session"

const app = express()

app.use(cookieParser("encoded"))//firmamos la cookie para q se borre si la alteran
app.use(session({  //middleware para usar el session en el get
    secret : "MelSession", //clave secreta 
    resave : true, //seteado en true para q cuando el usuario este inactivo no se desloguee
    saveUninitialized:true, //guarda cualquier sesion aunque no tenga datos, todas son opcionales.
}))

const auth = (req, res, next) => { //middleware para autenticar admin y mostrar contenido privado
    if(req.session.user && req.session.admmin) {
        next()
    } else {
        res.send("No estas logueado")
    }
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

//endpoints
app.get("/session", (req, res) =>{
    if(req.session.contador) {
        req.session.contador++
        res.send(`Has visitado esta pagina ${req.session.contador} veces!`)
    } else {
        req.session.contador = 1
        res.send("Bienvenido a esta pagina por primera vez")
    }
})

app.get("/profile", (req, res) =>{
    if(req.session.user) {
        res.send(`Nombre: ${req.session.user}!`)
    } else {
        res.send("No estas logueado")
    }
})

app.get("/privado", auth, (req, res) =>{ //agregamos midd auth 
    res.send("Contenido Privado")
})

const users = ["admin", "pepe", "arturo"]

app.get("/login", (req, res) =>{
    const {user, password} = req.query //pedimos datos ?user=admin&password=1234
    if(users.includes(user) && password === "1234" ){
        req.session.user = user
        if(user=== "admin" ){
            req.session.admin = true
        }
            res.send("Bienvenido")  
    } else {
        res.send("Usuario o contraseña incorrectos")
    }
})

app.get("/logout", (req,res)=>{
req.session.destroy((error) => {
    if(error) {
        console.log("Error al intentar cerrar la sesion")
} else {
        res.send("Sesion Cerrada")
}
  })
     })

app.get("/getCookies", (req, res) =>{
     res.json(req.cookies)//obtenemos las cookies creadas y mostrarlas en pantalla
})

app.get("/deleteCookie", (req, res) =>{
    res.clearCookie("Coder Cookie")//Borramos la cookie con el nombre de ella 
    res.send("Cookie Borrada")
})

app.get("/signedCookie", (req, res) =>{
    res.cookie("Coder Cookie Signed", "Coder House", {signed: true, maxAge:1000000})//Setea una cookie firmada
    res.send("Cookie firmada")
})

app.listen(3000, ()=> console.log("Server running on port 3000"))
