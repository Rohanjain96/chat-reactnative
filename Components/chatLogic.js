export const getSenderName = (messages,index,user)=>{
    if(index === 0 && user.user.name !== messages[0].sender.name)
    return messages[0].sender.name
    if(index>0&&(messages[index].sender._id !== messages[index-1].sender._id)){
        if(user.user.name !== messages[index].sender.name)
        return( messages[index].sender.name);
    }
}
