import { useEffect } from "react";
import { toast } from "react-toastify";
import { MessageCircle } from "lucide-react";
import { socketAddListener, socketRemoveListener } from "../../socket/socket";

export const ChatNotifications = ({ currentUserId, onMessageClick }) => {
    useEffect(() => {
        if (!currentUserId) return;

        const handleNewMessage = (data) => {
            const myId = currentUserId?.toString();
            const receiverId = data.receiverId?.toString();
            const isMessageForMe = receiverId === myId;

            if (isMessageForMe) {
                console.log('ChatNotification received for me:', data.senderName);
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIGWi77eifTRAMUKfj8LZjHAY4ktfyz3osBSN2x/DekEAKE1+z6eqnVRUJRZ/g8r5sIQUrgc7y2Ik3CBlou+3on00QDFCn4/C2YxwGOJLX8s96LAUjdsfw3pBACxJctOnqp1UVCUSe4PK+bCEFK4HO8tmJNwgZaLvt6J9NEAxQp+PwtmMcBjiS1/LPeiwFI3bH8N6QQAsRXLPp6qdVFQlEnuDyvmwhBSuBzvLZiTcIGWi77eifTRAMUKfj8LZjHAY4ktfyz3osBSN2x/DekEALEFuz6eqnVRUJRJ7g8r5sIQUrgc7y2Yk3CBlou+3on00QDFCn4/C2YxwGOJLX8s96LAUjdsfw3pBACw9bs+nqp1UVCUSe4PK+bCEFK4HO8tmJNwgZaLvt6J9NEAxQp+PwtmMcBjiS1/LPeiwFI3bH8N6QQAsPW7Pp6qdVFQlEnuDyvmwhBSuBzvLZiTcIGWi77eifTRAMUKfj8LZjHAY4ktfyz3osBSN2x/DekEALD1uz6eqnVRUJRJ7g8r5sIQUrgc7y2Yk3CBlou+3on00QDFCn4/C2YxwGOJLX8s96LAUjdsfw3pBACA==');
                audio.play().catch(() => { });

                toast(`Nova mensagem de ${data.senderName}`, {
                    position: "top-right",
                    autoClose: 5000,
                    icon: <MessageCircle size={20} color="#dc2626" />,
                    onClick: () => {
                        window.dispatchEvent(new CustomEvent('navigateToChat', {
                            detail: { targetUserId: data.senderId }
                        }));
                        if (onMessageClick) {
                            onMessageClick(data.senderId);
                        }
                    },
                    style: { cursor: 'pointer', zIndex: 99999 }
                });
            }
        };

        const handleWorkoutMissed = (data) => {
            const myId = currentUserId?.toString();

            if (data.trainerId === myId) {
                toast.warn(
                    <div onClick={() => {
                        const event = new CustomEvent('navigateToChat', {
                            detail: { targetUserId: data.clientId }
                        });
                        window.dispatchEvent(event);

                        if (onMessageClick) {
                            onMessageClick(data.clientId);
                        }
                    }} style={{ cursor: 'pointer' }}>
                        {data.clientName} faltou ao treino.<br />
                        <small>Motivo: {data.reason}</small><br />
                        <strong>Clique para abrir conversa</strong>
                    </div>,
                    {
                        position: "top-right",
                        autoClose: 15000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        icon: "🚨"
                    });
            }
        };

        socketAddListener('new-message', handleNewMessage);
        socketAddListener('workout-missed', handleWorkoutMissed);

        return () => {
            socketRemoveListener('new-message', handleNewMessage);
            socketRemoveListener('workout-missed', handleWorkoutMissed);
        };
    }, [currentUserId, onMessageClick]);

    return null;
};

export default ChatNotifications;
