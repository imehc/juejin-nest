import {
  passBookingAction,
  rejectBookingAction,
  unbindBookingAction,
} from "./actions";

import { BookingList, bookingListSchema } from "@/components/booking";
import { UnknownError } from "@/components/unknown-error";
import { apiInstance } from "@/helper/auth";
import {
  BookingApi,
  type BookingApiFindAllBookingRequest,
} from "@/meeting-room-booking-api";

export default async function SystemBookingPage({
  searchParams,
}: {
  searchParams: unknown;
}) {
  const payload = bookingListSchema.safeParse(searchParams);

  if (!payload.success) {
    return <UnknownError />;
  }
  const bookingApi = apiInstance(BookingApi);
  const bookingList = await bookingApi.findAllBooking({
    ...(payload.data as BookingApiFindAllBookingRequest),
    skip: payload.data.skip + 1,
  });

  return (
    <BookingList
      {...bookingList}
      passBooking={passBookingAction}
      rejectBooking={rejectBookingAction}
      status={payload.data.status}
      type="system"
      unbindBooking={unbindBookingAction}
    />
  );
}
