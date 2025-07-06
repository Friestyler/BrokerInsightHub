import React from "react";
import PartnerActivityHub from "@/components/activity/PartnerActivityHub";
import { useEntityDetail } from "../EntityDetailCore";

interface ActivityTabProps {
  className?: string;
}

export function ActivityTab({ className = "" }: ActivityTabProps) {
  const { entityData } = useEntityDetail();
  const { entity, allTasks, timeline, activities } = entityData;

  return (
    <div className={className}>
      <PartnerActivityHub 
        partnerId={entity?.id}
        allTasks={allTasks}
        timeline={timeline}
        activities={activities}
      />
    </div>
  );
}