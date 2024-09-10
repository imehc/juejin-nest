"use client";

import { Button, ButtonProps } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { meetingRoomAction } from "./actions";

import { MeetingRoom } from "@/meeting-room-booking-api";
import { parseResult } from "@/helper/parse-result";

export function MeetingRoomForm({
  id,
  name,
  capacity,
  location,
  equipment,
  description,
}: Partial<MeetingRoom>) {
  const router = useRouter();
  const [handleState, handleFormAction] = useFormState(meetingRoomAction, {});

  useEffect(() => {
    parseResult(handleState, router.back);
  }, [handleState]);

  return (
    <form
      action=""
      autoComplete="off"
      className="flex flex-col items-center justify-center w-full h-full"
    >
      {/* <h1 className="flex items-center justify-start gap-1 mb-2 text-2xl font-bold">
        {!!id ? "更新会议室" : "创建会议室"}
      </h1> */}
      <Input
        // isDisabled //设置该选项formData无法读取
        isReadOnly
        className="hidden max-w-sm mb-4"
        defaultValue={id?.toString()}
        label="会议室ID"
        name="id"
        type="text"
      />
      <Input
        isRequired
        className="max-w-sm mb-4"
        defaultValue={name}
        errorMessage={handleState?.validationErrors?.name?.join(" ")}
        isInvalid={!!handleState?.validationErrors?.name?.length}
        label="会议室名称"
        name="name"
        type="text"
      />
      <Input
        isRequired
        className="max-w-sm mb-4"
        defaultValue={capacity?.toString()}
        errorMessage={handleState?.validationErrors?.capacity?.join(" ")}
        isInvalid={!!handleState?.validationErrors?.capacity?.length}
        label="容纳人数"
        name="capacity"
        type="number"
      />
      <Input
        isRequired
        className="max-w-sm mb-4"
        defaultValue={location}
        errorMessage={handleState?.validationErrors?.location?.join(" ")}
        isInvalid={!!handleState?.validationErrors?.location?.length}
        label="地址"
        name="location"
        type="text"
      />
      <Input
        className="max-w-sm mb-4"
        defaultValue={equipment}
        errorMessage={handleState?.validationErrors?.equipment?.join(" ")}
        isInvalid={!!handleState?.validationErrors?.equipment?.length}
        label="设备名称"
        name="equipment"
        type="text"
      />
      <Input
        className="max-w-sm mb-4"
        defaultValue={description}
        errorMessage={handleState?.validationErrors?.description?.join(" ")}
        isInvalid={!!handleState?.validationErrors?.description?.length}
        label="描述"
        name="description"
        type="text"
      />

      <SubmitButton formAction={handleFormAction} hasUpdated={!!id} />
    </form>
  );
}

function SubmitButton({
  hasUpdated,
  ...props
}: ButtonProps & { hasUpdated: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      fullWidth
      className="max-w-sm"
      color="primary"
      isDisabled={pending}
      type="submit"
      {...props}
    >
      {pending
        ? `${hasUpdated ? "更新" : "创建"}中...`
        : hasUpdated
          ? "更新"
          : "创建"}
    </Button>
  );
}