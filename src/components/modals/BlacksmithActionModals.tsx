import React from 'react';
import { SimpleActionModal } from './SimpleActionModal';

interface BlacksmithActionModalsProps {
  showExchangeInstrumentModal: boolean;
  showUpgradeClockModal: boolean;
  showUpgradeShovelModal: boolean;
  showUpgradeTimeMachineModal: boolean;
  onDeclineExchangeInstrument: () => void;
  onConfirmExchangeInstrument: () => void;
  onCloseUpgradeClock: () => void;
  onConfirmUpgradeClock: () => void;
  onCloseUpgradeShovel: () => void;
  onConfirmUpgradeShovel: () => void;
  onCloseUpgradeTimeMachine: () => void;
  onConfirmUpgradeTimeMachine: () => void;
}

export const BlacksmithActionModals: React.FC<BlacksmithActionModalsProps> = ({
  showExchangeInstrumentModal,
  showUpgradeClockModal,
  showUpgradeShovelModal,
  showUpgradeTimeMachineModal,
  onDeclineExchangeInstrument,
  onConfirmExchangeInstrument,
  onCloseUpgradeClock,
  onConfirmUpgradeClock,
  onCloseUpgradeShovel,
  onConfirmUpgradeShovel,
  onCloseUpgradeTimeMachine,
  onConfirmUpgradeTimeMachine,
}) => {
  return (
    <>
      {/* 米蘭小鐵匠交換樂器確認視窗 */}
      <SimpleActionModal
        isOpen={showExchangeInstrumentModal}
        icon="🎻"
        title="✦ 樂器交流・烏克麗麗 ✦"
        subtitle="遭遇米蘭的小鐵匠・樂器贈予"
        description={
          <>
            你身上正持有【烏克麗麗】！
            <br />
            小鐵匠一心想買把吉他隨興彈唱，是否願意將【烏克麗麗】送給小鐵匠？
          </>
        }
        tip={
          <>
            💡 <span className="font-bold">交換物品說明：</span>贈送 1 把【烏克麗麗】，完成小鐵匠的心願。
          </>
        }
        cancelText="保留【烏克麗麗】"
        confirmText="確認交換"
        onCancel={onDeclineExchangeInstrument}
        onConfirm={onConfirmExchangeInstrument}
      />

      {/* 米蘭小鐵匠改造鐘錶確認視窗 */}
      <SimpleActionModal
        isOpen={showUpgradeClockModal}
        icon="🕰️"
        title="✦ 重鑄鐘錶・大笨鐘 ✦"
        subtitle="遭遇米蘭的小鐵匠・改造鐘錶"
        description={
          <>
            你身上正持有【反方向的鐘】！
            <br />
            是否交由小鐵匠以純熟工藝，為你重鑄改造成【大笨鐘】？
          </>
        }
        tip={
          <>
            💡 <span className="font-bold">改造說明：</span>消耗 1 個【反方向的鐘】，重鑄改造成【大笨鐘】。
          </>
        }
        cancelText="保留【反方向的鐘】"
        confirmText="確認改造"
        onCancel={onCloseUpgradeClock}
        onConfirm={onConfirmUpgradeClock}
      />

      {/* 米蘭小鐵匠重鑄鐵鏟確認視窗 */}
      <SimpleActionModal
        isOpen={showUpgradeShovelModal}
        icon="⚒️"
        title="✦ 重鑄工具・鐵鏟 ✦"
        subtitle="遭遇米蘭的小鐵匠・重鑄武器"
        description={
          <>
            你身上正持有【雙截棍】！
            <br />
            熊熊爐火，武器也能重新鍛造成合適的工具。是否交由小鐵匠為你重鑄成【鐵鏟】？
          </>
        }
        tip={
          <>
            💡 <span className="font-bold">改造說明：</span>消耗 1 把【雙截棍】，重鑄改造成 1 把【鐵鏟】。
          </>
        }
        cancelText="保留【雙截棍】"
        confirmText="確認改造"
        onCancel={onCloseUpgradeShovel}
        onConfirm={onConfirmUpgradeShovel}
      />

      {/* 米蘭小鐵匠強化時光機確認視窗 */}
      <SimpleActionModal
        isOpen={showUpgradeTimeMachineModal}
        icon="🚀"
        title="✦ 強化時光機・飛行時光機 ✦"
        subtitle="遭遇米蘭的小鐵匠・強化機械"
        description={
          <>
            你身上正同時持有【時光機】與【愛的飛行日記】！
            <br />
            是否透過【愛的飛行日記】把【時光機】強化為【飛行時光機】？
          </>
        }
        tip={
          <>
            💡 <span className="font-bold">強化說明：</span>消耗 1 本【愛的飛行日記】，將【時光機】升級強化為【飛行時光機】。
          </>
        }
        cancelText="暫不強化"
        confirmText="確認強化"
        onCancel={onCloseUpgradeTimeMachine}
        onConfirm={onConfirmUpgradeTimeMachine}
      />
    </>
  );
};

export default BlacksmithActionModals;
