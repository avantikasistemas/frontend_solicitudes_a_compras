<template>
    <div class="container">
        <div class="login-container">
            <div class="header-title">
              <img class="img-title" :src="logo" :alt="logo">
              <h2>Solicitudes Avantika</h2>
            </div>
            <h2 class="h2-sesion">Iniciar Sesión</h2>
            <form @submit.prevent="">
                <label for="username">Usuario:</label>
                <input type="text" id="username" v-model="username" required>

                <label for="password">Contraseña:</label>
                <div class="password-container">
                    <input 
                        :type="showPassword ? 'text' : 'password'" 
                        id="password" 
                        v-model="password" 
                        required
                    >
                    <i 
                        :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'" 
                        class="toggle-password" 
                        @click="togglePasswordVisibility"
                    ></i>
                </div>

                <button type="submit" @click="login">Ingresar</button>
            </form>
            <p v-show="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>
    </div>
</template>

<script setup>

import apiUrl from "../../config.js";
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import logo from "@/assets/logo.png";

const username = ref("");
const password = ref("");
const showPassword = ref(false);

const errorMessage = ref("");

const router = useRouter();

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
};

// Función de inicio de sesión
const login = async () => {
  try {
    const response = await axios.post(
      `${apiUrl}/login`,
      {
        usuario: username.value,
        password: password.value,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    if (response.status === 200) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("usuario_creador", response.data.data.usuario);
        router.push("/solicitudes");
    }
  } catch (err) {
    console.error("este es el error", err);
    console.log(err.response.data.message);
    errorMessage.value = err.response.data.message || "Error al iniciar sesión";
  }
};

</script>

<style scoped>
body {
    margin: 0;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
}

.login-container {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 550px;
    height: 500px;
}

.header-title {
  margin-top: 30px;
  margin-right: 30px;
  display: flex;
  justify-content: center;
  align-content: space-evenly;
}

.header-title h2 {
  color: #2778bf;
}

.img-title {
  width: 60px;
  height: 50px;
  margin-right: 10px;
}

h2 {
    margin-bottom: 20px;
    font-weight: bold;
    font-size: 1.5em;
    color: #333;
}

.h2-sesion {
  margin-top: 30px;
}

input {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
    height: 35px;
}

button {
    width: 100%;
    margin-top: 10px;
    padding: 10px;
    background: #2778bf;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
    font-size: 0.9em;
}

button:hover {
    background: #4385be;
}

.error-message {
    color: red;
    font-size: 14px;
    margin-top: 10px;
    display: block;
}

.success-message {
    color: green;
    font-size: 14px;
    margin-top: 10px;
    display: none;
}

.password-container {
    position: relative;
    display: flex;
    align-items: center;
}

.password-container input {
    flex: 1;
}

.toggle-password {
    position: absolute;
    right: 10px;
    cursor: pointer;
    color: #888;
    font-size: 1.2em;
    transition: color 0.3s;
}

.toggle-password:hover {
    color: #2778bf;
}
</style>