"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { saveQuestionAnswer } from "@/app/actions/save-question-answer"
import { Check, Loader2, Edit2, X } from "lucide-react"

/* ================= Types ================= */

export type OpenQuestion = {
  _id?: string
  id?: string
  category: string
  question: string
  suggestedAnswer?: string
  tags?: string[] 
  userAnswer?: string 
  answered?: boolean
  status?: QuestionStatus
  createdAt?: Date
}

export type QuestionStatus = "open" | "answered" | "not_applicable"

export type QuestionReview = {
  questionId: string
  status: QuestionStatus
}

/* ================= Props ================= */

export function OpenQuestionsTable({
  openQuestions,
  assessmentId,
  onAnswerSaved,
}: {
  openQuestions: OpenQuestion[]
  assessmentId: string
  onAnswerSaved?: (questionId: string, status: QuestionStatus) => void
}) {
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  if (!openQuestions?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No open questions identified.
      </p>
    )
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setLocalAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleEditClick = (questionId: string, currentAnswer: string) => {
    setEditingId(questionId)
    setLocalAnswers((prev) => ({
      ...prev,
      [questionId]: currentAnswer,
    }))
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setLocalAnswers({})
  }

  const handleSaveAnswer = async (questionId: string) => {
    const answer = localAnswers[questionId]

    if (!answer?.trim()) {
      alert("Please provide an answer before saving")
      return
    }

    setSavingId(questionId)

    try {
      await saveQuestionAnswer(assessmentId, questionId, answer, "answered")
      onAnswerSaved?.(questionId, "answered")
      setLocalAnswers((prev) => {
        const copy = { ...prev }
        delete copy[questionId]
        return copy
      })
    } catch (error) {
      console.error("Failed to save answer:", error)
      alert("Failed to save answer. Please try again.")
    } finally {
      setSavingId(null)
    }
  }

  const handleMarkNotApplicable = async (questionId: string) => {
    setSavingId(questionId)

    try {
      await saveQuestionAnswer(assessmentId, questionId, "", "not_applicable")
      onAnswerSaved?.(questionId, "not_applicable")
      setLocalAnswers((prev) => {
        const copy = { ...prev }
        delete copy[questionId]
        return copy
      })
    } catch (error) {
      console.error("Failed to save status:", error)
      alert("Failed to update status. Please try again.")
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border">
      <Table className="w-full table-fixed full-border-table border-gray-200">
        {/* ================= Header ================= */}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px] border text-center">#</TableHead>
            <TableHead className="w-[140px] border text-center">Category</TableHead>
            <TableHead className="w-[120px] border text-center">Tags</TableHead>
            <TableHead className="w-[300px] border text-center">Open Question</TableHead>
            <TableHead className="w-[210px] border text-center">Your Answer</TableHead>
            <TableHead className="w-[120px] border text-center">Status</TableHead>
          </TableRow>
        </TableHeader>

        {/* ================= Body ================= */}
        <TableBody>
          {openQuestions.map((q, idx) => {
            const questionId = q.id ?? q._id ?? `q-${idx}`
            const isAnswered = q.answered || q.status === "answered"
            const isNotApplicable = q.status === "not_applicable"
            const isSaving = savingId === questionId
            const currentAnswer = localAnswers[questionId] ?? ""

            return (
              <TableRow key={questionId} className="align-top">
                {/* # */}
                <TableCell className="text-sm border text-center">
                  {idx + 1}
                </TableCell>

                {/* Category */}
                <TableCell className="text-sm text-center whitespace-normal break-words border">
                  {q.category}
                </TableCell>

                {/* Tags */}
                <TableCell className="text-xs whitespace-normal break-words border">
                  {q.tags?.length ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {q.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] px-2 py-0.5"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-center block">-</span>
                  )}
                </TableCell>

                {/* Question */}
                <TableCell className="text-sm whitespace-normal break-words border">
                  <div className="space-y-2">
                    <p className="font-medium">{q.question}</p>
                    {q.suggestedAnswer && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold">Suggested: </span>
                        {q.suggestedAnswer}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Answer Input */}
                <TableCell className="border p-2">
                  {(isAnswered || isNotApplicable) && editingId !== questionId ? (
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-xs font-medium text-green-700">
                        {isAnswered ? "Answered" : "Not Applicable"}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClick(questionId, q.userAnswer || "")}
                        className="text-xs h-6 p-1 ml-2"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Type your answer here..."
                        value={currentAnswer}
                        onChange={(e) =>
                          handleAnswerChange(questionId, e.target.value)
                        }
                        className="text-xs h-20 resize-none"
                        disabled={isSaving}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveAnswer(questionId)}
                          disabled={isSaving || !currentAnswer?.trim()}
                          className="text-xs h-7"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Saving...
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkNotApplicable(questionId)}
                          disabled={isSaving}
                          className="text-xs h-7"
                        >
                          {isSaving ? "..." : "Not Applicable"}
                        </Button>
                        {editingId === questionId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="text-xs h-7"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </TableCell>

                {/* Status Indicator */}
                <TableCell className="text-center border">
                  {isAnswered ? (
                    <Badge className="bg-green-100 text-green-700">
                      Answered
                    </Badge>
                  ) : isNotApplicable ? (
                    <Badge variant="outline" className="bg-gray-100">
                      Not Applicable
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                      Open
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
