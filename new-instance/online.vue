<template>
    <div class="online-status">
        <div v-if="online" class="online">
            <span class="light"></span>
            <p>Online</p>
        </div>
        <div v-else class="offline">
            <span class="light"></span>
            <p>Offline</p>
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return {
            online: true
        }
    }
}
</script>

<style>
.online-status {
    background: #eeeeee;
    border: 1px dashed #dddddd;
    display: inline-block;
    padding: 10px;
}
</style>