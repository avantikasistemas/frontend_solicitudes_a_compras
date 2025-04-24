<template>
    <div class="layout-container">
      <Navbar />
      <main class="main-content">
        <slot></slot>
      </main>
    </div>
</template>

<script setup>
  import Navbar from './NavbarView.vue';
</script>

<style scoped>
/* Contenedor general que incluye el sidebar y el contenido */
.layout-container {
  display: flex;
  width: 100vw;
  height: 100vh;
}

/* Contenido principal que estará a la derecha del sidebar */
.main-content {
  flex-grow: 1;
  padding: 20px;
  margin-left: 250px; /* Espacio igual al ancho del sidebar */
  overflow-y: auto; /* Permite scroll si el contenido es largo */
  background: #f5f5fa;
}
</style>