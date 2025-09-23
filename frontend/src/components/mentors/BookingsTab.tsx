import React from "react";
import { Calendar, Video, MessageCircle, User, Clock } from "lucide-react";
import { Button } from "../ui/Button";
import type { BookingSession } from "../../api/messaging";

interface BookingsTabProps {
  bookings: BookingSession[];
  handleJoinSession: (sessionId: number) => void;
}

export default function BookingsTab({
  bookings,
  handleJoinSession,
}: BookingsTabProps) {
  return (
    <div className="space-y-6">
      {bookings.length === 0 ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-100 rounded-2xl border border-primary-200 p-12 text-center">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full flex items-center justify-center shadow-lg">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-800 mb-2">
              No bookings yet
            </h3>
            <p className="text-secondary-600 max-w-md mx-auto">
              Schedule your first mentorship session to start your learning
              journey!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking: any) => {
            const getStatusColor = (status: string) => {
              switch (status) {
                case "confirmed":
                  return "bg-success-100 text-success-800 border-success-200";
                case "pending":
                  return "bg-warning-100 text-warning-800 border-warning-200";
                case "in_progress":
                  return "bg-secondary-100 text-secondary-800 border-secondary-200";
                case "completed":
                  return "bg-neutral-100 text-neutral-700 border-neutral-200";
                case "cancelled":
                  return "bg-error-100 text-error-800 border-error-200";
                default:
                  return "bg-neutral-100 text-neutral-700 border-neutral-200";
              }
            };

            const getSessionTypeIcon = (type: string) => {
              switch (type) {
                case "video":
                  return <Video className="w-5 h-5" />;
                case "chat":
                  return <MessageCircle className="w-5 h-5" />;
                default:
                  return <Calendar className="w-5 h-5" />;
              }
            };

            return (
              <div
                key={booking.id}
                className="group relative bg-white rounded-2xl shadow-sm border border-neutral-200 hover:shadow-lg hover:border-neutral-300 transition-all duration-200 overflow-hidden"
              >
                {/* Status indicator bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    booking.status === "confirmed"
                      ? "bg-success-500"
                      : booking.status === "pending"
                      ? "bg-warning-500"
                      : booking.status === "in_progress"
                      ? "bg-secondary-500"
                      : "bg-neutral-500"
                  }`}
                ></div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center text-white shadow-md">
                        {getSessionTypeIcon(booking.session_type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-secondary-900 text-lg">
                          {booking.session_type.replace("_", " ").toUpperCase()}{" "}
                          Session with {booking.mentor_name}
                        </h3>
                        <p className="text-sm text-neutral-500">
                          Session #{booking.id}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 text-secondary-700">
                        <div className="w-10 h-10 bg-secondary-50 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">Mentor</p>
                          <p className="font-semibold">{booking.mentor_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-secondary-700">
                        <div className="w-10 h-10 bg-secondary-50 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">
                            Date & Time
                          </p>
                          <p className="font-semibold">
                            {new Date(booking.session_date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}{" "}
                            at {booking.start_time}{" "}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 text-secondary-700">
                        <div className="w-10 h-10 bg-secondary-50 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">Duration</p>
                          <p className="font-semibold">
                            {booking.duration_minutes} minutes
                          </p>
                        </div>
                      </div>

                      {booking.description && (
                        <div className="bg-neutral-50 rounded-lg p-4">
                          <p className="text-sm text-neutral-500 mb-1">
                            Description
                          </p>
                          <p className="text-secondary-700">
                            {booking.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                    <div className="flex items-center space-x-2 text-sm text-neutral-500">
                      <Clock className="w-4 h-4" />
                      <span>
                        Created{" "}
                        {new Date(booking.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex space-x-3">
                      {booking.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-error-600 border-error-200 hover:bg-error-50"
                        >
                          Cancel
                        </Button>
                      )}

                      {(booking.status === "confirmed" ||
                        booking.status === "in_progress") && (
                        <Button
                          size="sm"
                          onClick={() => handleJoinSession(booking.id)}
                          className="bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Session</span>
                        </Button>
                      )}

                      {booking.status === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-primary-600 border-primary-200 hover:bg-primary-50"
                        >
                          Leave Review
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
