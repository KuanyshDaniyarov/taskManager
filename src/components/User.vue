<template>
  <div class="user">
    <UserAvatar
      :avatar="user.avatar"
      :name="user.full_name"
      :initials="user.initials"
      :disabled="true"
    />
    <div>
      <div class="text position">
        {{user.full_name}}
      </div>
      <div class="text">
        {{user.position}}, {{user.department}}
      </div>
    </div>
  </div>
</template>

<script>
import UserAvatar from './UserAvatar';

export default {
  components: { UserAvatar },
  props: {
    user: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style scoped>
.user {
  display: inline-flex;
  align-items: center;
  padding: 8px;
}
.text {
  width: 285px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.position {
  font-weight: bold;
  font-size: 12px;
}
</style>