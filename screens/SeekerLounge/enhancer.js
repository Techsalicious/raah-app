import React, { useEffect, useState } from "react"
import { BackHandler } from "react-native"
import { useSelector } from "react-redux"
import { useFirebase, useFirebaseConnect } from "react-redux-firebase"
import { useFocusEffect } from "@react-navigation/native"

export default (Component) => (props) => {
  const { navigation } = props
  const firebase = useFirebase()
  let auth = props.route.params

  useFirebaseConnect([`waiting/${auth.uid}`], ["waiting"])
  const waiting = useSelector(
    ({ firebase: { data } }) => data.waiting && data.waiting[auth.uid]
  )

  const profile = useSelector((state) => state.firebase.profile)

  const onCancelSession = async () => {
    navigation.navigate("FrontPageScreen")
    firebase.ref(`waiting/${auth.uid}`).remove()
  }

  useFocusEffect(() => {
    if (profile.notify == "yes") firebase.updateProfile({ notify: "busy" })
  })

  useEffect(() => {
    if (waiting && waiting.listener) {
      let roomId = `${auth.uid}-${waiting.listener}`
      firebase.ref(`waiting/${auth.uid}`).remove()
      navigation.navigate("ChatScreen", { roomId, role: "talker" })
    }
  }, [waiting])

  useEffect(() => {
    const handleBackPress = () => true
    BackHandler.addEventListener("hardwareBackPress", handleBackPress)
    return BackHandler.removeEventListener("hardwareBackPress", handleBackPress)
  }, [])

  useEffect(() => {
    if (props.acceptedByListener) {
      navigation.navigate("ChatScreen")
    }
  }, [props.acceptedByListener])

  return <Component {...props} {...{ onCancelSession }} />
}
