<template>
</template>
  
<script setup>

  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import logo from '@/assets/logo.png';
  
  const token = ref("");
  const nombre = ref("");
  const cedula = ref("");
  
  const router = useRouter();
  
  const logout = () => {
      localStorage.clear();
      router.push('/'); // Redirigir al login
  }
  
  
  onMounted(() => {
      // token.value = localStorage.getItem("token");
      // nombre.value = localStorage.getItem("nombre");
      // cedula.value = localStorage.getItem("cedula");
  });
</script>
  
<style scoped>
  body {
    font-family: 'Arial', sans-serif;
    display: flex;
    margin: 0;
    padding: 0;
    background: #f5f5fa;
    width: 250px;
    height: 100vh;
    overflow: hidden;
  }

.header-div {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.header-div img {
    margin-right: 8px;
    width: 32px; 
    height: 32px;
}
.header-div h1 {
    font-size: 1.25rem;
    font-weight: bold;
}
  
  .main-navbar {
    display: flex;
    height: 100vh;
  }
  
  .sidebar {
    width: 250px;
    height: 100vh;
    background: #2c2e48;
    color: white;
    padding: 20px;
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
  }
  
  .sidebar h2 {
    text-align: center;
    font-weight: bold;
    font-size: 1.6rem;
  }
  
  nav ul {
    list-style: none;
    padding: 0;
  }

  nav {
    flex-grow: 1; /* Empuja el botón hacia abajo */
  }
  
  nav ul li {
    margin: 20px 0;
  }
  
  nav ul li a, nav ul li router-link {
    color: white;
    text-decoration: none;
    padding: 10px;
    display: block;
    border-radius: 5px;
    transition: background 0.3s;
  }

  nav ul li .router-link-active {
    background: #454866; /* Color de fondo cuando está activo */
    font-weight: bold;
  }
  
  nav ul li a:hover,
  .active {
    background: #454866;
  }
  
  .logout {
    background: #772017;
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    border-radius: 5px;
    text-align: center;
    transition: 0.4s;
  }

  .logout:hover {
    background: #a73a2e;
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    border-radius: 5px;
    text-align: center;
  }
  
  
</style>
  